/**
 * Used for calculating clusterings of nodes.
 *
 * Modified version of: https://github.com/john-guerra/forceInABox
 *
 * Changes:
 *  - Improved d3 import for tree shaking
 *  - Fixed node lookup for edges using array
 *  - Updated d3-force to use d3-force-3d
 *  - Removed template logic
 */
export declare function forceInABox(): {
    (alpha: any): any;
    initialize(_: any): void;
    template(x: any): string | any;
    groupBy(x: any): (d: any) => any;
    enableGrouping(x: any): boolean | any;
    strength(x: any): any;
    getLinkStrength(e: any): any;
    id(_: any): (d: any) => any;
    size(_: any): number[] | any;
    linkStrengthInterCluster(_: any): number | any;
    linkStrengthIntraCluster(_: any): number | any;
    nodes(_: any): any[] | any;
    links(_: any): any[] | any;
    forceNodeSize(_: any): (() => any) | any;
    nodeSize: (_: any) => (() => any) | any;
    forceCharge(_: any): (() => any) | any;
    forceLinkDistance(_: any): (() => any) | any;
    forceLinkStrength(_: any): (() => any) | any;
    offset(_: any): number[] | any;
    getFocis: () => {};
};
