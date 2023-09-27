import postcss, { AtRule, Rule } from 'postcss';
import type * as PostCSS from 'postcss';

type Options = {
  forceHoverable?: boolean;
};
type Plugin = (decl: PostCSS.Declaration, opts: Required<Options>) => void;

const defaults: Required<Options> = {
  forceHoverable: false,
};

const PSEUDO_HOVER = ':hover';
const PSEUDO_FORCE_HOVER = ':force-hover';
const MEDIA_PARAMS = '(hover: hover)';

const plugin: Plugin = (decl, { forceHoverable }) => {
  const { value, parent, prop, important } = decl;

  if (!(parent && 'selector' in parent && typeof parent.selector === 'string')) return;

  const selectors: string[] = parent.selector.split(',');
  if (
    !selectors.some((s) => s.includes(PSEUDO_HOVER) || s.includes(PSEUDO_FORCE_HOVER)) ||
    (parent.parent as any).params === MEDIA_PARAMS
  )
    return;

  const [hovers, nonHovers] = selectors.reduce<[string[], string[]]>(
    (prev, curt) => {
      if (curt.includes(PSEUDO_HOVER) || curt.includes(PSEUDO_FORCE_HOVER)) {
        prev[0].push(curt);
      } else {
        prev[1].push(curt);
      }
      return prev;
    },
    [[], []],
  );

  if (hovers.length > 0) {
    let selector = hovers.join(',');
    if (forceHoverable) {
      selector = selectors
        .map((s) => s.split(PSEUDO_HOVER).join(`:where(:any-link, :enabled, summary)${PSEUDO_HOVER}`))
        .join(',');
    }
    const newRule = postcss.rule({ selector });
    const mediaQuery = postcss.atRule({ name: 'media', params: MEDIA_PARAMS });
    const newDecl = postcss.decl({ prop, value, important });
    newRule.append(newDecl);
    mediaQuery.append(newRule);
    parent?.before(mediaQuery);
  }

  if (nonHovers.length > 0) {
    const newRule = postcss.rule({ selector: hovers.join(',') });
    const newDecl = postcss.decl({ prop, value, important });
    newRule.append(newDecl);
    parent?.before(newRule);
  }

  parent?.remove();
};

module.exports = (opts: Options): PostCSS.Plugin => {
  const options = { ...defaults, ...opts };
  return {
    postcssPlugin: 'postcss-hover-media-query',
    Rule: (rule) => {
      rule.each((child) => child.type === 'decl' && plugin(child, options));
    },
  };
};

module.exports.postcss = true;
