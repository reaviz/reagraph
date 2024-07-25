import React, { useRef } from 'react';
import { CustomLayoutInputs, GraphCanvas, GraphCanvasRef, NodePositionArgs, recommendLayout, SphereWithIcon, Theme, useSelection } from '../../src';
import { complexEdges, complexNodes, simpleEdges, simpleNodes } from '../assets/demo';

export default {
  title: 'Demos/Layouts',
  component: GraphCanvas
};

export const Recommender = () => {
  const layout = recommendLayout(complexNodes, complexEdges);

  return (
    <GraphCanvas
      layoutType={layout}
      nodes={complexNodes}
      edges={complexEdges}
    />
  );
};

export const Overrides = () => (
  <GraphCanvas
    layoutType="forceDirected2d"
    layoutOverrides={{
      nodeStrength: -50,
      linkDistance: 500
    }}
    nodes={complexNodes}
    edges={complexEdges}
  />
);

export const Custom = () => (
  <GraphCanvas
    layoutType="custom"
    layoutOverrides={{
      getNodePosition: (id: string, { nodes }: NodePositionArgs) => {
        const idx = nodes.findIndex(n => n.id === id);
        const node = nodes[idx];
        return {
          x: 25 * idx,
          y: idx % 2 === 0 ? 0 : 50,
          z: 1
        };
      }
    } as CustomLayoutInputs}
    nodes={simpleNodes}
    edges={simpleEdges}
  />
);



export const CustomNew = () => {
  const theme: Theme = {
    canvas: {
      background: "#fff",
    },
    node: {
      fill: "#000",
      activeFill: "#1de9ac",
      opacity: 1,
      selectedOpacity: 1,
      inactiveOpacity: 0.1,
      // showRing: false,
      label: {
        color: "#FFF",
        activeColor: "#fafafa",
        fontSize: 4,
        ellipsis: 0,
        maxWidth: 50,
        backgroundColor: "#000",
        borderRadius: 2,
      },
    },
    edge: {
      fill: "#d8e6ea",
      activeFill: "#1DE9AC",
      opacity: 0.6,
      selectedOpacity: 1,
      inactiveOpacity: 1,
      label: {
        color: "#FFF",
        activeColor: "#fafafa",
        fontSize: 4,
        ellipsis: 100,
        maxWidth: 50,
        backgroundColor: "#00a2a1",
        borderRadius: 4,
      },
    },
    lasso: {
      background: "#fff",
      border: "none",
    },
    arrow: {
      fill: "#808080",
      activeFill: "#1de9ac",
    },
    ring: {
      fill: "#000",
      activeFill: "#000",
    },
  };
  const testData = {
    "nodes": [
      {
        "id": "1097509",
        "label": "AUGUST EQUITY LLP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "1097509",
          "loaded": true,
          "extra": {
            "id": "1097509",
            "properties": {
              "company_type_group": "Limited Liability Partnership (LLP)",
              "company_number": "OC313101",
              "nationality": null,
              "name": "AUGUST EQUITY LLP",
              "company_status_group": "Active",
              "id": 2794668,
              "date_incorporated": "2005-05-05",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 1
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY LLP"
          }
        }
      },
      {
        "id": "157512609",
        "label": "AEP ACV EXECUTIVES PARTNERSHIP LP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "157512609",
          "loaded": true,
          "extra": {
            "id": "157512609",
            "properties": {
              "company_type_group": "Limited Partnership (LP)",
              "company_number": "SL036790",
              "nationality": null,
              "name": "AEP ACV EXECUTIVES PARTNERSHIP LP",
              "company_status_group": "Active",
              "id": 12199272,
              "date_incorporated": "2024-03-19",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AEP ACV EXECUTIVES PARTNERSHIP LP"
          }
        }
      },
      {
        "id": "77270647",
        "label": "AUGUST EQUITY PARTNERS V EXECUTIVES PARTNERSHIP LP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "77270647",
          "loaded": true,
          "extra": {
            "id": "77270647",
            "properties": {
              "company_type_group": "Limited Partnership (LP)",
              "company_number": "SL033845",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS V EXECUTIVES PARTNERSHIP LP",
              "company_status_group": "Active",
              "id": 6192798,
              "date_incorporated": "2019-06-25",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS V EXECUTIVES PARTNERSHIP LP"
          }
        }
      },
      {
        "id": "76328503",
        "label": "DC2 TOPCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "76328503",
          "loaded": true,
          "extra": {
            "id": "76328503",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC579748",
              "nationality": null,
              "name": "DC2 TOPCO LIMITED",
              "company_status_group": "Active",
              "id": 6057918,
              "date_incorporated": "2017-10-24",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "DC2 TOPCO LIMITED"
          }
        }
      },
      {
        "id": "72440875",
        "label": "PICNIC TOPCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "72440875",
          "loaded": true,
          "extra": {
            "id": "72440875",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11732793",
              "nationality": null,
              "name": "PICNIC TOPCO LIMITED",
              "company_status_group": "Active",
              "id": 5310220,
              "date_incorporated": "2018-12-18",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PICNIC TOPCO LIMITED"
          }
        }
      },
      {
        "id": "64087137",
        "label": "AUGUST EQUITY PARTNERS VI EXECUTIVES PARTNERSHIP LP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "64087137",
          "loaded": true,
          "extra": {
            "id": "64087137",
            "properties": {
              "company_type_group": "Limited Partnership (LP)",
              "company_number": "SL035885",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS VI EXECUTIVES PARTNERSHIP LP",
              "company_status_group": "Active",
              "id": 9109747,
              "date_incorporated": "2022-08-17",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS VI EXECUTIVES PARTNERSHIP LP"
          }
        }
      },
      {
        "id": "63707969",
        "label": "AEP FFCV EXECUTIVES PARTNERSHIP LP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "63707969",
          "loaded": true,
          "extra": {
            "id": "63707969",
            "properties": {
              "company_type_group": "Limited Partnership (LP)",
              "company_number": "SL035882",
              "nationality": null,
              "name": "AEP FFCV EXECUTIVES PARTNERSHIP LP",
              "company_status_group": "Active",
              "id": 9109478,
              "date_incorporated": "2022-08-17",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AEP FFCV EXECUTIVES PARTNERSHIP LP"
          }
        }
      },
      {
        "id": "63662309",
        "label": "PIVOT TOPCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "63662309",
          "loaded": true,
          "extra": {
            "id": "63662309",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14266892",
              "nationality": null,
              "name": "PIVOT TOPCO LIMITED",
              "company_status_group": "Active",
              "id": 9072072,
              "date_incorporated": "2022-08-01",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PIVOT TOPCO LIMITED"
          }
        }
      },
      {
        "id": "59927981",
        "label": "RUBICONE TOPCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "59927981",
          "loaded": true,
          "extra": {
            "id": "59927981",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13705334",
              "nationality": null,
              "name": "RUBICONE TOPCO LIMITED",
              "company_status_group": "Active",
              "id": 8457780,
              "date_incorporated": "2021-10-26",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "RUBICONE TOPCO LIMITED"
          }
        }
      },
      {
        "id": "58401266",
        "label": "AEP MVP EXECUTIVES PARTNERSHIP LP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "58401266",
          "loaded": true,
          "extra": {
            "id": "58401266",
            "properties": {
              "company_type_group": "Limited Partnership (LP)",
              "company_number": "SL035264",
              "nationality": null,
              "name": "AEP MVP EXECUTIVES PARTNERSHIP LP",
              "company_status_group": "Active",
              "id": 8196458,
              "date_incorporated": "2021-09-17",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AEP MVP EXECUTIVES PARTNERSHIP LP"
          }
        }
      },
      {
        "id": "58186128",
        "label": "PEAR PE II LP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "58186128",
          "loaded": true,
          "extra": {
            "id": "58186128",
            "properties": {
              "company_type_group": "Limited Partnership (LP)",
              "company_number": "SL035219",
              "nationality": null,
              "name": "PEAR PE II LP",
              "company_status_group": "Active",
              "id": 8155957,
              "date_incorporated": "2021-08-31",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PEAR PE II LP"
          }
        }
      },
      {
        "id": "58135744",
        "label": "AEP OCV EXECUTIVES PARTNERSHIP LP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "58135744",
          "loaded": true,
          "extra": {
            "id": "58135744",
            "properties": {
              "company_type_group": "Limited Partnership (LP)",
              "company_number": "SL035218",
              "nationality": null,
              "name": "AEP OCV EXECUTIVES PARTNERSHIP LP",
              "company_status_group": "Active",
              "id": 8154704,
              "date_incorporated": "2021-08-31",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AEP OCV EXECUTIVES PARTNERSHIP LP"
          }
        }
      },
      {
        "id": "53474506",
        "label": "SONDERWELL TOPCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "53474506",
          "loaded": true,
          "extra": {
            "id": "53474506",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13181399",
              "nationality": null,
              "name": "SONDERWELL TOPCO LIMITED",
              "company_status_group": "Active",
              "id": 7496669,
              "date_incorporated": "2021-02-05",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SONDERWELL TOPCO LIMITED"
          }
        }
      },
      {
        "id": "25849840",
        "label": "AUGUST EQUITY PARTNERS II GP LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "25849840",
          "loaded": true,
          "extra": {
            "id": "25849840",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC308304",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS II GP LIMITED",
              "company_status_group": "Active",
              "id": 2794679,
              "date_incorporated": "2006-09-08",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS II GP LIMITED"
          }
        }
      },
      {
        "id": "29038644",
        "label": "AUGUST EQUITY MANAGEMENT LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "29038644",
          "loaded": true,
          "extra": {
            "id": "29038644",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04261261",
              "nationality": null,
              "name": "AUGUST EQUITY MANAGEMENT LIMITED",
              "company_status_group": "Active",
              "id": 2794770,
              "date_incorporated": "2001-07-30",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY MANAGEMENT LIMITED"
          }
        }
      },
      {
        "id": "28986189",
        "label": "AUGUST EQUITY PARTNERS GP LLP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "28986189",
          "loaded": true,
          "extra": {
            "id": "28986189",
            "properties": {
              "company_type_group": "Limited Liability Partnership (LLP)",
              "company_number": "SO304148",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS GP LLP",
              "company_status_group": "Active",
              "id": 2794669,
              "date_incorporated": "2012-11-02",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS GP LLP"
          }
        }
      },
      {
        "id": "29037234",
        "label": "AUGUST EQUITY PARTNERS II EXECUTIVES GP LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "29037234",
          "loaded": true,
          "extra": {
            "id": "29037234",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC308307",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS II EXECUTIVES GP LIMITED",
              "company_status_group": "Active",
              "id": 2794677,
              "date_incorporated": "2006-09-08",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS II EXECUTIVES GP LIMITED"
          }
        }
      },
      {
        "id": "29117288",
        "label": "AUGUST EQUITY PARTNERS II EXECUTIVES PARTNERSHIP LP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "29117288",
          "loaded": true,
          "extra": {
            "id": "29117288",
            "properties": {
              "company_type_group": "Limited Partnership (LP)",
              "company_number": "SL006067",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS II EXECUTIVES PARTNERSHIP LP",
              "company_status_group": "Active",
              "id": 2794678,
              "date_incorporated": "2007-05-01",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS II EXECUTIVES PARTNERSHIP LP"
          }
        }
      },
      {
        "id": "29351327",
        "label": "AUGUST EQUITY PARTNERS III EXECUTIVES PARTNERSHIP LP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "29351327",
          "loaded": true,
          "extra": {
            "id": "29351327",
            "properties": {
              "company_type_group": "Limited Partnership (LP)",
              "company_number": "SL011774",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS III EXECUTIVES PARTNERSHIP LP",
              "company_status_group": "Active",
              "id": 2794684,
              "date_incorporated": "2012-11-16",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS III EXECUTIVES PARTNERSHIP LP"
          }
        }
      },
      {
        "id": "16685089",
        "label": "AUGUST EQUITY PARTNERS III GP LP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "16685089",
          "loaded": true,
          "extra": {
            "id": "16685089",
            "properties": {
              "company_type_group": "Limited Partnership (LP)",
              "company_number": "SL011773",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS III GP LP",
              "company_status_group": "Active",
              "id": 2794687,
              "date_incorporated": "2012-11-16",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS III GP LP"
          }
        }
      },
      {
        "id": "28987569",
        "label": "AUGUST EQUITY PARTNERS II GP LP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "28987569",
          "loaded": true,
          "extra": {
            "id": "28987569",
            "properties": {
              "company_type_group": "Limited Partnership (LP)",
              "company_number": "SL006066",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS II GP LP",
              "company_status_group": "Active",
              "id": 2794680,
              "date_incorporated": "2007-05-01",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS II GP LP"
          }
        }
      },
      {
        "id": "28986188",
        "label": "AUGUST EQUITY PARTNERS IV EXECUTIVES PARTNERSHIP LP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "28986188",
          "loaded": true,
          "extra": {
            "id": "28986188",
            "properties": {
              "company_type_group": "Limited Partnership (LP)",
              "company_number": "SL025471",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS IV EXECUTIVES PARTNERSHIP LP",
              "company_status_group": "Active",
              "id": 2794689,
              "date_incorporated": "2016-03-10",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS IV EXECUTIVES PARTNERSHIP LP"
          }
        }
      },
      {
        "id": "58248648",
        "label": "AUGUST EQUITY PARTNERS V GP LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "58248648",
          "loaded": true,
          "extra": {
            "id": "58248648",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "12056652",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS V GP LIMITED",
              "company_status_group": "Active",
              "id": 5729059,
              "date_incorporated": "2019-06-18",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS V GP LIMITED"
          }
        }
      },
      {
        "id": "63363287",
        "label": "AUGUST EQUITY PARTNERS VI GP LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "63363287",
          "loaded": true,
          "extra": {
            "id": "63363287",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14233106",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS VI GP LIMITED",
              "company_status_group": "Active",
              "id": 9035733,
              "date_incorporated": "2022-07-13",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS VI GP LIMITED"
          }
        }
      },
      {
        "id": "29038654",
        "label": "AUGUST EQUITY PARTNERS IV GP LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "29038654",
          "loaded": true,
          "extra": {
            "id": "29038654",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10033090",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS IV GP LIMITED",
              "company_status_group": "Active",
              "id": 2794691,
              "date_incorporated": "2016-02-29",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS IV GP LIMITED"
          }
        }
      },
      {
        "id": "29057144",
        "label": "AUGUST EQUITY PARTNERS III EXECUTIVES GP LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "29057144",
          "loaded": true,
          "extra": {
            "id": "29057144",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC436140",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS III EXECUTIVES GP LIMITED",
              "company_status_group": "Active",
              "id": 2794683,
              "date_incorporated": "2012-11-05",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS III EXECUTIVES GP LIMITED"
          }
        }
      },
      {
        "id": "9482442",
        "label": "AUGUST EQUITY PARTNERS III GP LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "9482442",
          "loaded": true,
          "extra": {
            "id": "9482442",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC436139",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS III GP LIMITED",
              "company_status_group": "Active",
              "id": 2794686,
              "date_incorporated": "2012-11-05",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS III GP LIMITED"
          }
        }
      },
      {
        "id": "3601064",
        "label": "AUGUST EQUITY PARTNERS IV GENERAL PARTNER LLP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "3601064",
          "loaded": true,
          "extra": {
            "id": "3601064",
            "properties": {
              "company_type_group": "Limited Liability Partnership (LLP)",
              "company_number": "OC407197",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS IV GENERAL PARTNER LLP",
              "company_status_group": "Active",
              "id": 2794690,
              "date_incorporated": "2016-03-11",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS IV GENERAL PARTNER LLP"
          }
        }
      },
      {
        "id": "60274638",
        "label": "AR HOLDCO 2022 LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "60274638",
          "loaded": true,
          "extra": {
            "id": "60274638",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14266787",
              "nationality": null,
              "name": "AR HOLDCO 2022 LIMITED",
              "company_status_group": "Active",
              "id": 9071948,
              "date_incorporated": "2022-08-01",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AR HOLDCO 2022 LIMITED"
          }
        }
      },
      {
        "id": "71206752",
        "label": "COPENHAGEN TOPCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "71206752",
          "loaded": true,
          "extra": {
            "id": "71206752",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11685459",
              "nationality": null,
              "name": "COPENHAGEN TOPCO LIMITED",
              "company_status_group": "Active",
              "id": 5121533,
              "date_incorporated": "2018-11-19",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "COPENHAGEN TOPCO LIMITED"
          }
        }
      },
      {
        "id": "71206722",
        "label": "COPENHAGEN MIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "71206722",
          "loaded": true,
          "extra": {
            "id": "71206722",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11685804",
              "nationality": null,
              "name": "COPENHAGEN MIDCO LIMITED",
              "company_status_group": "Active",
              "id": 5113483,
              "date_incorporated": "2018-11-19",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "COPENHAGEN MIDCO LIMITED"
          }
        }
      },
      {
        "id": "71966949",
        "label": "COPENHAGEN NOMINEE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "71966949",
          "loaded": true,
          "extra": {
            "id": "71966949",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11711162",
              "nationality": null,
              "name": "COPENHAGEN NOMINEE LIMITED",
              "company_status_group": "Active",
              "id": 5224080,
              "date_incorporated": "2018-12-04",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "COPENHAGEN NOMINEE LIMITED"
          }
        }
      },
      {
        "id": "71255608",
        "label": "COPENHAGEN FINCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "71255608",
          "loaded": true,
          "extra": {
            "id": "71255608",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11685910",
              "nationality": null,
              "name": "COPENHAGEN FINCO LIMITED",
              "company_status_group": "Active",
              "id": 5121532,
              "date_incorporated": "2018-11-19",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "COPENHAGEN FINCO LIMITED"
          }
        }
      },
      {
        "id": "8450956",
        "label": "COPENHAGEN BIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "8450956",
          "loaded": true,
          "extra": {
            "id": "8450956",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11685936",
              "nationality": null,
              "name": "COPENHAGEN BIDCO LIMITED",
              "company_status_group": "Active",
              "id": 5116573,
              "date_incorporated": "2018-11-20",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "COPENHAGEN BIDCO LIMITED"
          }
        }
      },
      {
        "id": "8415597",
        "label": "HALLMARQ VETERINARY IMAGING LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "8415597",
          "loaded": true,
          "extra": {
            "id": "8415597",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04061791",
              "nationality": null,
              "name": "HALLMARQ VETERINARY IMAGING LIMITED",
              "company_status_group": "Active",
              "id": 762982,
              "date_incorporated": "2000-08-30",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "HALLMARQ VETERINARY IMAGING LIMITED"
          }
        }
      },
      {
        "id": "8415431",
        "label": "HALLMARQ SYSTEMS LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "8415431",
          "loaded": true,
          "extra": {
            "id": "8415431",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03418089",
              "nationality": null,
              "name": "HALLMARQ SYSTEMS LTD",
              "company_status_group": "Active",
              "id": 762981,
              "date_incorporated": "1997-08-12",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "HALLMARQ SYSTEMS LTD"
          }
        }
      },
      {
        "id": "47567700",
        "label": "TDP TOPCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "47567700",
          "loaded": true,
          "extra": {
            "id": "47567700",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11429333",
              "nationality": null,
              "name": "TDP TOPCO LIMITED",
              "company_status_group": "Active",
              "id": 4977396,
              "date_incorporated": "2018-06-22",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "TDP TOPCO LIMITED"
          }
        }
      },
      {
        "id": "47302509",
        "label": "TDP MIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "47302509",
          "loaded": true,
          "extra": {
            "id": "47302509",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11429418",
              "nationality": null,
              "name": "TDP MIDCO LIMITED",
              "company_status_group": "Active",
              "id": 4930897,
              "date_incorporated": "2018-06-22",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "TDP MIDCO LIMITED"
          }
        }
      },
      {
        "id": "47171025",
        "label": "TDP FINCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "47171025",
          "loaded": true,
          "extra": {
            "id": "47171025",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11429743",
              "nationality": null,
              "name": "TDP FINCO LIMITED",
              "company_status_group": "Active",
              "id": 4913284,
              "date_incorporated": "2018-06-22",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "TDP FINCO LIMITED"
          }
        }
      },
      {
        "id": "4251987",
        "label": "TDP BIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "4251987",
          "loaded": true,
          "extra": {
            "id": "4251987",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11429829",
              "nationality": null,
              "name": "TDP BIDCO LIMITED",
              "company_status_group": "Active",
              "id": 4913277,
              "date_incorporated": "2018-06-22",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "TDP BIDCO LIMITED"
          }
        }
      },
      {
        "id": "857648",
        "label": "EVERYTHING SKIN LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "857648",
          "loaded": true,
          "extra": {
            "id": "857648",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "09748379",
              "nationality": null,
              "name": "EVERYTHING SKIN LIMITED",
              "company_status_group": "Active",
              "id": 376259,
              "date_incorporated": "2015-08-25",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "EVERYTHING SKIN LIMITED"
          }
        }
      },
      {
        "id": "29071915",
        "label": "ST. MICHAEL'S CLINIC LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "29071915",
          "loaded": true,
          "extra": {
            "id": "29071915",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "09341807",
              "nationality": null,
              "name": "ST. MICHAEL'S CLINIC LTD",
              "company_status_group": "Active",
              "id": 2767638,
              "date_incorporated": "2014-12-04",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ST. MICHAEL'S CLINIC LTD"
          }
        }
      },
      {
        "id": "29454102",
        "label": "STRATUM AESTHETICS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "29454102",
          "loaded": true,
          "extra": {
            "id": "29454102",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10435778",
              "nationality": null,
              "name": "STRATUM AESTHETICS LIMITED",
              "company_status_group": "Active",
              "id": 2828792,
              "date_incorporated": "2016-10-19",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "STRATUM AESTHETICS LIMITED"
          }
        }
      },
      {
        "id": "29710662",
        "label": "STRATUM CLINICS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "29710662",
          "loaded": true,
          "extra": {
            "id": "29710662",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "06550196",
              "nationality": null,
              "name": "STRATUM CLINICS LIMITED",
              "company_status_group": "Active",
              "id": 2828795,
              "date_incorporated": "2008-03-31",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "STRATUM CLINICS LIMITED"
          }
        }
      },
      {
        "id": "31422666",
        "label": "THE HARLEY STREET DERMATOLOGY CLINIC LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "31422666",
          "loaded": true,
          "extra": {
            "id": "31422666",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "07755270",
              "nationality": null,
              "name": "THE HARLEY STREET DERMATOLOGY CLINIC LTD",
              "company_status_group": "Active",
              "id": 3000965,
              "date_incorporated": "2011-08-30",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "THE HARLEY STREET DERMATOLOGY CLINIC LTD"
          }
        }
      },
      {
        "id": "11037174",
        "label": "CANTERBURY SKIN AND LASER CLINIC LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "11037174",
          "loaded": true,
          "extra": {
            "id": "11037174",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04551672",
              "nationality": null,
              "name": "CANTERBURY SKIN AND LASER CLINIC LIMITED",
              "company_status_group": "Active",
              "id": 3956912,
              "date_incorporated": "2002-10-02",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "CANTERBURY SKIN AND LASER CLINIC LIMITED"
          }
        }
      },
      {
        "id": "72491674",
        "label": "PICNIC MIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "72491674",
          "loaded": true,
          "extra": {
            "id": "72491674",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11732964",
              "nationality": null,
              "name": "PICNIC MIDCO LIMITED",
              "company_status_group": "Active",
              "id": 5306882,
              "date_incorporated": "2018-12-18",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PICNIC MIDCO LIMITED"
          }
        }
      },
      {
        "id": "72491548",
        "label": "PICNIC FINCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "72491548",
          "loaded": true,
          "extra": {
            "id": "72491548",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11733123",
              "nationality": null,
              "name": "PICNIC FINCO LIMITED",
              "company_status_group": "Active",
              "id": 5318571,
              "date_incorporated": "2018-12-18",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PICNIC FINCO LIMITED"
          }
        }
      },
      {
        "id": "21028235",
        "label": "PICNIC BIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "21028235",
          "loaded": true,
          "extra": {
            "id": "21028235",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11733211",
              "nationality": null,
              "name": "PICNIC BIDCO LIMITED",
              "company_status_group": "Active",
              "id": 5310213,
              "date_incorporated": "2018-12-18",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PICNIC BIDCO LIMITED"
          }
        }
      },
      {
        "id": "21027914",
        "label": "ORACLE CARE AND EDUCATION HOLDINGS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "21027914",
          "loaded": true,
          "extra": {
            "id": "21027914",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "07822510",
              "nationality": null,
              "name": "ORACLE CARE AND EDUCATION HOLDINGS LIMITED",
              "company_status_group": "Active",
              "id": 1997378,
              "date_incorporated": "2011-10-25",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ORACLE CARE AND EDUCATION HOLDINGS LIMITED"
          }
        }
      },
      {
        "id": "16956699",
        "label": "THE ESLAND GROUP HOLDINGS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "16956699",
          "loaded": true,
          "extra": {
            "id": "16956699",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10622572",
              "nationality": null,
              "name": "THE ESLAND GROUP HOLDINGS LIMITED",
              "company_status_group": "Active",
              "id": 2989890,
              "date_incorporated": "2017-02-16",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "THE ESLAND GROUP HOLDINGS LIMITED"
          }
        }
      },
      {
        "id": "16956339",
        "label": "MAPPLETON HOUSE CARE HOMES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "16956339",
          "loaded": true,
          "extra": {
            "id": "16956339",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "05861707",
              "nationality": null,
              "name": "MAPPLETON HOUSE CARE HOMES LIMITED",
              "company_status_group": "Active",
              "id": 1595725,
              "date_incorporated": "2006-06-29",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "MAPPLETON HOUSE CARE HOMES LIMITED"
          }
        }
      },
      {
        "id": "9479159",
        "label": "THE ESLAND GROUP LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "9479159",
          "loaded": true,
          "extra": {
            "id": "9479159",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "06944039",
              "nationality": null,
              "name": "THE ESLAND GROUP LIMITED",
              "company_status_group": "Active",
              "id": 2989891,
              "date_incorporated": "2009-06-25",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "THE ESLAND GROUP LIMITED"
          }
        }
      },
      {
        "id": "9478859",
        "label": "ESLAND NORTH LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "9478859",
          "loaded": true,
          "extra": {
            "id": "9478859",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04181878",
              "nationality": null,
              "name": "ESLAND NORTH LIMITED",
              "company_status_group": "Active",
              "id": 861514,
              "date_incorporated": "2001-03-19",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ESLAND NORTH LIMITED"
          }
        }
      },
      {
        "id": "9544744",
        "label": "ESLAND SOUTH LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "9544744",
          "loaded": true,
          "extra": {
            "id": "9544744",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04685174",
              "nationality": null,
              "name": "ESLAND SOUTH LIMITED",
              "company_status_group": "Active",
              "id": 861515,
              "date_incorporated": "2003-03-04",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ESLAND SOUTH LIMITED"
          }
        }
      },
      {
        "id": "21165577",
        "label": "ORACLE CARE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "21165577",
          "loaded": true,
          "extra": {
            "id": "21165577",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "05618803",
              "nationality": null,
              "name": "ORACLE CARE LIMITED",
              "company_status_group": "Active",
              "id": 1997231,
              "date_incorporated": "2005-11-10",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ORACLE CARE LIMITED"
          }
        }
      },
      {
        "id": "76328436",
        "label": "DC2 MIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "76328436",
          "loaded": true,
          "extra": {
            "id": "76328436",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC579775",
              "nationality": null,
              "name": "DC2 MIDCO LIMITED",
              "company_status_group": "Active",
              "id": 6057990,
              "date_incorporated": "2017-10-24",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "DC2 MIDCO LIMITED"
          }
        }
      },
      {
        "id": "76569596",
        "label": "DC2 FINCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "76569596",
          "loaded": true,
          "extra": {
            "id": "76569596",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC579794",
              "nationality": null,
              "name": "DC2 FINCO LIMITED",
              "company_status_group": "Active",
              "id": 6058027,
              "date_incorporated": "2017-10-25",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "DC2 FINCO LIMITED"
          }
        }
      },
      {
        "id": "31662431",
        "label": "DC2 BIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "31662431",
          "loaded": true,
          "extra": {
            "id": "31662431",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC579814",
              "nationality": null,
              "name": "DC2 BIDCO LIMITED",
              "company_status_group": "Active",
              "id": 6058045,
              "date_incorporated": "2017-10-25",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "DC2 BIDCO LIMITED"
          }
        }
      },
      {
        "id": "3756137",
        "label": "THE INDEPENDENT FAMILY FUNERAL DIRECTORS LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "3756137",
          "loaded": true,
          "extra": {
            "id": "3756137",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC391536",
              "nationality": null,
              "name": "THE INDEPENDENT FAMILY FUNERAL DIRECTORS LTD",
              "company_status_group": "Active",
              "id": 3004984,
              "date_incorporated": "2011-01-14",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "THE INDEPENDENT FAMILY FUNERAL DIRECTORS LTD"
          }
        }
      },
      {
        "id": "3756016",
        "label": "DEERY FUNERAL SERVICES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "3756016",
          "loaded": true,
          "extra": {
            "id": "3756016",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC451759",
              "nationality": null,
              "name": "DEERY FUNERAL SERVICES LIMITED",
              "company_status_group": "Active",
              "id": 329468,
              "date_incorporated": "2013-06-06",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "DEERY FUNERAL SERVICES LIMITED"
          }
        }
      },
      {
        "id": "39826722",
        "label": "DAVID ROBB INDEPENDENT FUNERAL DIRECTORS LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "39826722",
          "loaded": true,
          "extra": {
            "id": "39826722",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC530971",
              "nationality": null,
              "name": "DAVID ROBB INDEPENDENT FUNERAL DIRECTORS LTD",
              "company_status_group": "Active",
              "id": 3812487,
              "date_incorporated": "2016-03-30",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "DAVID ROBB INDEPENDENT FUNERAL DIRECTORS LTD"
          }
        }
      },
      {
        "id": "157393865",
        "label": "BLUEBIRD TOPCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "157393865",
          "loaded": true,
          "extra": {
            "id": "157393865",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "15562589",
              "nationality": null,
              "name": "BLUEBIRD TOPCO LIMITED",
              "company_status_group": "Active",
              "id": 12184804,
              "date_incorporated": "2024-03-14",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "BLUEBIRD TOPCO LIMITED"
          }
        }
      },
      {
        "id": "63363285",
        "label": "AUGUST EQUITY PARTNERS VI GENERAL PARTNER LLP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "63363285",
          "loaded": true,
          "extra": {
            "id": "63363285",
            "properties": {
              "company_type_group": "Limited Liability Partnership (LLP)",
              "company_number": "OC443193",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS VI GENERAL PARTNER LLP",
              "company_status_group": "Active",
              "id": 9049174,
              "date_incorporated": "2022-07-20",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS VI GENERAL PARTNER LLP"
          }
        }
      },
      {
        "id": "157388007",
        "label": "BLUEBIRD MIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "157388007",
          "loaded": true,
          "extra": {
            "id": "157388007",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "15562668",
              "nationality": null,
              "name": "BLUEBIRD MIDCO LIMITED",
              "company_status_group": "Active",
              "id": 12184875,
              "date_incorporated": "2024-03-14",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "BLUEBIRD MIDCO LIMITED"
          }
        }
      },
      {
        "id": "157392763",
        "label": "BLUEBIRD FINCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "157392763",
          "loaded": true,
          "extra": {
            "id": "157392763",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "15562787",
              "nationality": null,
              "name": "BLUEBIRD FINCO LIMITED",
              "company_status_group": "Active",
              "id": 12185003,
              "date_incorporated": "2024-03-14",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "BLUEBIRD FINCO LIMITED"
          }
        }
      },
      {
        "id": "157394138",
        "label": "BLUEBIRD BIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "157394138",
          "loaded": true,
          "extra": {
            "id": "157394138",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "15563011",
              "nationality": null,
              "name": "BLUEBIRD BIDCO LIMITED",
              "company_status_group": "Active",
              "id": 12185250,
              "date_incorporated": "2024-03-14",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "BLUEBIRD BIDCO LIMITED"
          }
        }
      },
      {
        "id": "11447727",
        "label": "NATIONAL TRAINING COMPANY LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "11447727",
          "loaded": true,
          "extra": {
            "id": "11447727",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10049897",
              "nationality": null,
              "name": "NATIONAL TRAINING COMPANY LIMITED",
              "company_status_group": "Active",
              "id": 1839450,
              "date_incorporated": "2016-03-08",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "NATIONAL TRAINING COMPANY LIMITED"
          }
        }
      },
      {
        "id": "11447637",
        "label": "HERROS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "11447637",
          "loaded": true,
          "extra": {
            "id": "11447637",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "09276192",
              "nationality": null,
              "name": "HERROS LIMITED",
              "company_status_group": "Active",
              "id": 1036008,
              "date_incorporated": "2014-10-22",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "HERROS LIMITED"
          }
        }
      },
      {
        "id": "11449380",
        "label": "THE CHILD CARE COMPANY (OLD WINDSOR) LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "11449380",
          "loaded": true,
          "extra": {
            "id": "11449380",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "06507416",
              "nationality": null,
              "name": "THE CHILD CARE COMPANY (OLD WINDSOR) LIMITED",
              "company_status_group": "Active",
              "id": 2978678,
              "date_incorporated": "2008-02-18",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "THE CHILD CARE COMPANY (OLD WINDSOR) LIMITED"
          }
        }
      },
      {
        "id": "5024320",
        "label": "FIRST RESPONSE (FIRST AID) LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "5024320",
          "loaded": true,
          "extra": {
            "id": "5024320",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "05762926",
              "nationality": null,
              "name": "FIRST RESPONSE (FIRST AID) LIMITED",
              "company_status_group": "Active",
              "id": 451557,
              "date_incorporated": "2006-03-30",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "FIRST RESPONSE (FIRST AID) LIMITED"
          }
        }
      },
      {
        "id": "30962374",
        "label": "CAIN NOMINEES LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "30962374",
          "loaded": true,
          "extra": {
            "id": "30962374",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14423006",
              "nationality": null,
              "name": "CAIN NOMINEES LTD",
              "company_status_group": "Active",
              "id": 9240401,
              "date_incorporated": "2022-10-17",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "CAIN NOMINEES LTD"
          }
        }
      },
      {
        "id": "11449037",
        "label": "IMPACT FUTURES TRAINING LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "11449037",
          "loaded": true,
          "extra": {
            "id": "11449037",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03131863",
              "nationality": null,
              "name": "IMPACT FUTURES TRAINING LIMITED",
              "company_status_group": "Active",
              "id": 1036273,
              "date_incorporated": "1995-11-29",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "IMPACT FUTURES TRAINING LIMITED"
          }
        }
      },
      {
        "id": "51820911",
        "label": "AUGUST EQUITY PARTNERS V GENERAL PARTNER LLP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "51820911",
          "loaded": true,
          "extra": {
            "id": "51820911",
            "properties": {
              "company_type_group": "Limited Liability Partnership (LLP)",
              "company_number": "OC427816",
              "nationality": null,
              "name": "AUGUST EQUITY PARTNERS V GENERAL PARTNER LLP",
              "company_status_group": "Active",
              "id": 5823748,
              "date_incorporated": "2019-06-25",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AUGUST EQUITY PARTNERS V GENERAL PARTNER LLP"
          }
        }
      },
      {
        "id": "69933558",
        "label": "AEP V INVESTMENT GENERAL PARTNER LLP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "69933558",
          "loaded": true,
          "extra": {
            "id": "69933558",
            "properties": {
              "company_type_group": "Limited Liability Partnership (LLP)",
              "company_number": "OC447594",
              "nationality": null,
              "name": "AEP V INVESTMENT GENERAL PARTNER LLP",
              "company_status_group": "Active",
              "id": 11453958,
              "date_incorporated": "2023-05-31",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AEP V INVESTMENT GENERAL PARTNER LLP"
          }
        }
      },
      {
        "id": "68906211",
        "label": "AEP V CO-INVEST I GENERAL PARTNER LLP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "68906211",
          "loaded": true,
          "extra": {
            "id": "68906211",
            "properties": {
              "company_type_group": "Limited Liability Partnership (LLP)",
              "company_number": "OC446179",
              "nationality": null,
              "name": "AEP V CO-INVEST I GENERAL PARTNER LLP",
              "company_status_group": "Active",
              "id": 11241040,
              "date_incorporated": "2023-03-07",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AEP V CO-INVEST I GENERAL PARTNER LLP"
          }
        }
      },
      {
        "id": "63504014",
        "label": "AEP FFCV GENERAL PARTNER LLP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "63504014",
          "loaded": true,
          "extra": {
            "id": "63504014",
            "properties": {
              "company_type_group": "Limited Liability Partnership (LLP)",
              "company_number": "OC443192",
              "nationality": null,
              "name": "AEP FFCV GENERAL PARTNER LLP",
              "company_status_group": "Active",
              "id": 9049157,
              "date_incorporated": "2022-07-20",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AEP FFCV GENERAL PARTNER LLP"
          }
        }
      },
      {
        "id": "58425014",
        "label": "AEP MVP GENERAL PARTNER LLP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "58425014",
          "loaded": true,
          "extra": {
            "id": "58425014",
            "properties": {
              "company_type_group": "Limited Liability Partnership (LLP)",
              "company_number": "OC439188",
              "nationality": null,
              "name": "AEP MVP GENERAL PARTNER LLP",
              "company_status_group": "Active",
              "id": 8194240,
              "date_incorporated": "2021-09-16",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AEP MVP GENERAL PARTNER LLP"
          }
        }
      },
      {
        "id": "58248635",
        "label": "AEP OCV GENERAL PARTNER LLP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "58248635",
          "loaded": true,
          "extra": {
            "id": "58248635",
            "properties": {
              "company_type_group": "Limited Liability Partnership (LLP)",
              "company_number": "OC438915",
              "nationality": null,
              "name": "AEP OCV GENERAL PARTNER LLP",
              "company_status_group": "Active",
              "id": 8142071,
              "date_incorporated": "2021-08-26",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AEP OCV GENERAL PARTNER LLP"
          }
        }
      },
      {
        "id": "64758183",
        "label": "FAMILY FIRST TOPCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "64758183",
          "loaded": true,
          "extra": {
            "id": "64758183",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14452930",
              "nationality": null,
              "name": "FAMILY FIRST TOPCO LIMITED",
              "company_status_group": "Active",
              "id": 9275139,
              "date_incorporated": "2022-10-31",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "FAMILY FIRST TOPCO LIMITED"
          }
        }
      },
      {
        "id": "64758118",
        "label": "FAMILY FIRST BIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "64758118",
          "loaded": true,
          "extra": {
            "id": "64758118",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14453456",
              "nationality": null,
              "name": "FAMILY FIRST BIDCO LIMITED",
              "company_status_group": "Active",
              "id": 9275714,
              "date_incorporated": "2022-10-31",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "FAMILY FIRST BIDCO LIMITED"
          }
        }
      },
      {
        "id": "73653378",
        "label": "LGDN TOPCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "73653378",
          "loaded": true,
          "extra": {
            "id": "73653378",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11960895",
              "nationality": null,
              "name": "LGDN TOPCO LIMITED",
              "company_status_group": "Active",
              "id": 5724241,
              "date_incorporated": "2019-04-24",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "LGDN TOPCO LIMITED"
          }
        }
      },
      {
        "id": "73653263",
        "label": "LGDN MIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "73653263",
          "loaded": true,
          "extra": {
            "id": "73653263",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11961014",
              "nationality": null,
              "name": "LGDN MIDCO LIMITED",
              "company_status_group": "Active",
              "id": 5482611,
              "date_incorporated": "2019-04-24",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "LGDN MIDCO LIMITED"
          }
        }
      },
      {
        "id": "48703688",
        "label": "LGDN FINCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "48703688",
          "loaded": true,
          "extra": {
            "id": "48703688",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11961095",
              "nationality": null,
              "name": "LGDN FINCO LIMITED",
              "company_status_group": "Active",
              "id": 5684999,
              "date_incorporated": "2019-04-24",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "LGDN FINCO LIMITED"
          }
        }
      },
      {
        "id": "1528851",
        "label": "LGDN BIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "1528851",
          "loaded": true,
          "extra": {
            "id": "1528851",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11961278",
              "nationality": null,
              "name": "LGDN BIDCO LIMITED",
              "company_status_group": "Active",
              "id": 6723843,
              "date_incorporated": "2019-04-24",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "LGDN BIDCO LIMITED"
          }
        }
      },
      {
        "id": "21926624",
        "label": "PELICAN PLACE NURSERY LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "21926624",
          "loaded": true,
          "extra": {
            "id": "21926624",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "05404051",
              "nationality": null,
              "name": "PELICAN PLACE NURSERY LIMITED",
              "company_status_group": "Active",
              "id": 2089853,
              "date_incorporated": "2005-03-24",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PELICAN PLACE NURSERY LIMITED"
          }
        }
      },
      {
        "id": "36431470",
        "label": "ZIPADEE DAY NURSERY LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "36431470",
          "loaded": true,
          "extra": {
            "id": "36431470",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "09236821",
              "nationality": null,
              "name": "ZIPADEE DAY NURSERY LIMITED",
              "company_status_group": "Active",
              "id": 3476851,
              "date_incorporated": "2014-09-26",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ZIPADEE DAY NURSERY LIMITED"
          }
        }
      },
      {
        "id": "27799848",
        "label": "SMALL PEOPLE LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "27799848",
          "loaded": true,
          "extra": {
            "id": "27799848",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10605281",
              "nationality": null,
              "name": "SMALL PEOPLE LTD",
              "company_status_group": "Active",
              "id": 2683799,
              "date_incorporated": "2017-02-07",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SMALL PEOPLE LTD"
          }
        }
      },
      {
        "id": "63218002",
        "label": "LGDN CROSS STREAM LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "63218002",
          "loaded": true,
          "extra": {
            "id": "63218002",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14222523",
              "nationality": null,
              "name": "LGDN CROSS STREAM LIMITED",
              "company_status_group": "Active",
              "id": 9023996,
              "date_incorporated": "2022-07-08",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "LGDN CROSS STREAM LIMITED"
          }
        }
      },
      {
        "id": "60235625",
        "label": "LGDN PROPCO1 LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "60235625",
          "loaded": true,
          "extra": {
            "id": "60235625",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13746077",
              "nationality": null,
              "name": "LGDN PROPCO1 LIMITED",
              "company_status_group": "Active",
              "id": 8508954,
              "date_incorporated": "2021-11-16",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "LGDN PROPCO1 LIMITED"
          }
        }
      },
      {
        "id": "2810030",
        "label": "DR JOURNEY LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "2810030",
          "loaded": true,
          "extra": {
            "id": "2810030",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13936067",
              "nationality": null,
              "name": "DR JOURNEY LIMITED",
              "company_status_group": "Active",
              "id": 8717362,
              "date_incorporated": "2022-02-23",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "DR JOURNEY LIMITED"
          }
        }
      },
      {
        "id": "42562724",
        "label": "CHILD'S TIME HOLDINGS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "42562724",
          "loaded": true,
          "extra": {
            "id": "42562724",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14136103",
              "nationality": null,
              "name": "CHILD'S TIME HOLDINGS LIMITED",
              "company_status_group": "Active",
              "id": 8932645,
              "date_incorporated": "2022-05-27",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "CHILD'S TIME HOLDINGS LIMITED"
          }
        }
      },
      {
        "id": "59946985",
        "label": "ORCHARD HOUSE DAY NURSERIES & PRE-SCHOOL LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "59946985",
          "loaded": true,
          "extra": {
            "id": "59946985",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14415374",
              "nationality": null,
              "name": "ORCHARD HOUSE DAY NURSERIES & PRE-SCHOOL LIMITED",
              "company_status_group": "Active",
              "id": 9232175,
              "date_incorporated": "2022-10-12",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ORCHARD HOUSE DAY NURSERIES & PRE-SCHOOL LIMITED"
          }
        }
      },
      {
        "id": "5282454",
        "label": "FOOTSTEPS DAY NURSERIES HOLDINGS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "5282454",
          "loaded": true,
          "extra": {
            "id": "5282454",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13525731",
              "nationality": null,
              "name": "FOOTSTEPS DAY NURSERIES HOLDINGS LIMITED",
              "company_status_group": "Active",
              "id": 8068519,
              "date_incorporated": "2021-07-22",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "FOOTSTEPS DAY NURSERIES HOLDINGS LIMITED"
          }
        }
      },
      {
        "id": "14149349",
        "label": "KIDS PLAY CHILDCARE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "14149349",
          "loaded": true,
          "extra": {
            "id": "14149349",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10987956",
              "nationality": null,
              "name": "KIDS PLAY CHILDCARE LIMITED",
              "company_status_group": "Active",
              "id": 4972114,
              "date_incorporated": "2017-09-29",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "KIDS PLAY CHILDCARE LIMITED"
          }
        }
      },
      {
        "id": "42250493",
        "label": "CHESTNUT HOUSE KINDERGARTEN LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "42250493",
          "loaded": true,
          "extra": {
            "id": "42250493",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "05099687",
              "nationality": null,
              "name": "CHESTNUT HOUSE KINDERGARTEN LIMITED",
              "company_status_group": "Active",
              "id": 4044863,
              "date_incorporated": "2004-04-13",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "CHESTNUT HOUSE KINDERGARTEN LIMITED"
          }
        }
      },
      {
        "id": "42205095",
        "label": "CHERRY CHILDCARE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "42205095",
          "loaded": true,
          "extra": {
            "id": "42205095",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "08696962",
              "nationality": null,
              "name": "CHERRY CHILDCARE LIMITED",
              "company_status_group": "Active",
              "id": 4041099,
              "date_incorporated": "2013-09-19",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "CHERRY CHILDCARE LIMITED"
          }
        }
      },
      {
        "id": "40653784",
        "label": "FAMILY FIRST HOLDINGS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "40653784",
          "loaded": true,
          "extra": {
            "id": "40653784",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10673002",
              "nationality": null,
              "name": "FAMILY FIRST HOLDINGS LIMITED",
              "company_status_group": "Active",
              "id": 3968235,
              "date_incorporated": "2017-03-15",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "FAMILY FIRST HOLDINGS LIMITED"
          }
        }
      },
      {
        "id": "40403496",
        "label": "BRIMPTON HOUSE NURSERY LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "40403496",
          "loaded": true,
          "extra": {
            "id": "40403496",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "05404069",
              "nationality": null,
              "name": "BRIMPTON HOUSE NURSERY LIMITED",
              "company_status_group": "Active",
              "id": 3866876,
              "date_incorporated": "2005-03-24",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "BRIMPTON HOUSE NURSERY LIMITED"
          }
        }
      },
      {
        "id": "37178130",
        "label": "BIZZY BEES NURSERY LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "37178130",
          "loaded": true,
          "extra": {
            "id": "37178130",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "06747748",
              "nationality": null,
              "name": "BIZZY BEES NURSERY LIMITED",
              "company_status_group": "Active",
              "id": 3555045,
              "date_incorporated": "2008-11-12",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "BIZZY BEES NURSERY LIMITED"
          }
        }
      },
      {
        "id": "35781622",
        "label": "WOODLANDS DAY CARE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "35781622",
          "loaded": true,
          "extra": {
            "id": "35781622",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "07752557",
              "nationality": null,
              "name": "WOODLANDS DAY CARE LIMITED",
              "company_status_group": "Active",
              "id": 3402078,
              "date_incorporated": "2011-08-25",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "WOODLANDS DAY CARE LIMITED"
          }
        }
      },
      {
        "id": "31584047",
        "label": "THE OLD SCHOOLHOUSE KINDERGARTEN LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "31584047",
          "loaded": true,
          "extra": {
            "id": "31584047",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04472348",
              "nationality": null,
              "name": "THE OLD SCHOOLHOUSE KINDERGARTEN LIMITED",
              "company_status_group": "Active",
              "id": 3022838,
              "date_incorporated": "2002-06-28",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "THE OLD SCHOOLHOUSE KINDERGARTEN LIMITED"
          }
        }
      },
      {
        "id": "31419061",
        "label": "THE LITTLE SCHOOL DAYCARE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "31419061",
          "loaded": true,
          "extra": {
            "id": "31419061",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04967940",
              "nationality": null,
              "name": "THE LITTLE SCHOOL DAYCARE LIMITED",
              "company_status_group": "Active",
              "id": 3012028,
              "date_incorporated": "2003-11-18",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "THE LITTLE SCHOOL DAYCARE LIMITED"
          }
        }
      },
      {
        "id": "30976975",
        "label": "THE COACH HOUSE DAY NURSERY LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "30976975",
          "loaded": true,
          "extra": {
            "id": "30976975",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "05130302",
              "nationality": null,
              "name": "THE COACH HOUSE DAY NURSERY LIMITED",
              "company_status_group": "Active",
              "id": 2980324,
              "date_incorporated": "2004-05-18",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "THE COACH HOUSE DAY NURSERY LIMITED"
          }
        }
      },
      {
        "id": "29690998",
        "label": "SUNBEAMS CHILDCARE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "29690998",
          "loaded": true,
          "extra": {
            "id": "29690998",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04490052",
              "nationality": null,
              "name": "SUNBEAMS CHILDCARE LIMITED",
              "company_status_group": "Active",
              "id": 2848311,
              "date_incorporated": "2002-07-19",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SUNBEAMS CHILDCARE LIMITED"
          }
        }
      },
      {
        "id": "29306457",
        "label": "NURSERY ON THE HILL (ENFIELD) LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "29306457",
          "loaded": true,
          "extra": {
            "id": "29306457",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "05872591",
              "nationality": null,
              "name": "NURSERY ON THE HILL (ENFIELD) LIMITED",
              "company_status_group": "Active",
              "id": 2808048,
              "date_incorporated": "2006-07-11",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "NURSERY ON THE HILL (ENFIELD) LIMITED"
          }
        }
      },
      {
        "id": "26613837",
        "label": "SCRIBBLES NURSERY LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "26613837",
          "loaded": true,
          "extra": {
            "id": "26613837",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04985494",
              "nationality": null,
              "name": "SCRIBBLES NURSERY LIMITED",
              "company_status_group": "Active",
              "id": 2560329,
              "date_incorporated": "2003-12-05",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SCRIBBLES NURSERY LIMITED"
          }
        }
      },
      {
        "id": "25434420",
        "label": "ROSEWOOD MONTESSORI NURSERY LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "25434420",
          "loaded": true,
          "extra": {
            "id": "25434420",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03959289",
              "nationality": null,
              "name": "ROSEWOOD MONTESSORI NURSERY LIMITED",
              "company_status_group": "Active",
              "id": 2443639,
              "date_incorporated": "2000-03-29",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ROSEWOOD MONTESSORI NURSERY LIMITED"
          }
        }
      },
      {
        "id": "24216696",
        "label": "RAINBOW NURSERY (KENTISH TOWN) LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "24216696",
          "loaded": true,
          "extra": {
            "id": "24216696",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "05099480",
              "nationality": null,
              "name": "RAINBOW NURSERY (KENTISH TOWN) LTD",
              "company_status_group": "Active",
              "id": 2311834,
              "date_incorporated": "2004-04-08",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "RAINBOW NURSERY (KENTISH TOWN) LTD"
          }
        }
      },
      {
        "id": "23343871",
        "label": "PRIMA MONTESSORI LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "23343871",
          "loaded": true,
          "extra": {
            "id": "23343871",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03839567",
              "nationality": null,
              "name": "PRIMA MONTESSORI LIMITED",
              "company_status_group": "Active",
              "id": 2217690,
              "date_incorporated": "1999-09-10",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PRIMA MONTESSORI LIMITED"
          }
        }
      },
      {
        "id": "23003035",
        "label": "POPPIES DAY NURSERIES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "23003035",
          "loaded": true,
          "extra": {
            "id": "23003035",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "06799713",
              "nationality": null,
              "name": "POPPIES DAY NURSERIES LIMITED",
              "company_status_group": "Active",
              "id": 2187673,
              "date_incorporated": "2009-01-23",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "POPPIES DAY NURSERIES LIMITED"
          }
        }
      },
      {
        "id": "22916243",
        "label": "PLAY AWAY DAY NURSERIES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "22916243",
          "loaded": true,
          "extra": {
            "id": "22916243",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "02814442",
              "nationality": null,
              "name": "PLAY AWAY DAY NURSERIES LIMITED",
              "company_status_group": "Active",
              "id": 2170843,
              "date_incorporated": "1993-04-30",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PLAY AWAY DAY NURSERIES LIMITED"
          }
        }
      },
      {
        "id": "1528742",
        "label": "ABILITY 2 CREATE LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "1528742",
          "loaded": true,
          "extra": {
            "id": "1528742",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "08905422",
              "nationality": null,
              "name": "ABILITY 2 CREATE LTD",
              "company_status_group": "Active",
              "id": 130552,
              "date_incorporated": "2014-02-20",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ABILITY 2 CREATE LTD"
          }
        }
      },
      {
        "id": "2157641",
        "label": "ACORN MONTESSORI SCHOOL LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "2157641",
          "loaded": true,
          "extra": {
            "id": "2157641",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "05585026",
              "nationality": null,
              "name": "ACORN MONTESSORI SCHOOL LIMITED",
              "company_status_group": "Active",
              "id": 178828,
              "date_incorporated": "2005-10-06",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ACORN MONTESSORI SCHOOL LIMITED"
          }
        }
      },
      {
        "id": "7114975",
        "label": "ELLINGHAM HOUSE DAY NURSERY LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "7114975",
          "loaded": true,
          "extra": {
            "id": "7114975",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03124031",
              "nationality": null,
              "name": "ELLINGHAM HOUSE DAY NURSERY LIMITED",
              "company_status_group": "Active",
              "id": 644619,
              "date_incorporated": "1995-11-09",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ELLINGHAM HOUSE DAY NURSERY LIMITED"
          }
        }
      },
      {
        "id": "7883082",
        "label": "GREENFIELDS NURSERY SCHOOL LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "7883082",
          "loaded": true,
          "extra": {
            "id": "7883082",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "07708142",
              "nationality": null,
              "name": "GREENFIELDS NURSERY SCHOOL LTD",
              "company_status_group": "Active",
              "id": 717588,
              "date_incorporated": "2011-07-18",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "GREENFIELDS NURSERY SCHOOL LTD"
          }
        }
      },
      {
        "id": "8838899",
        "label": "HEAD START (ENFIELD) LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "8838899",
          "loaded": true,
          "extra": {
            "id": "8838899",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03770720",
              "nationality": null,
              "name": "HEAD START (ENFIELD) LIMITED",
              "company_status_group": "Active",
              "id": 803964,
              "date_incorporated": "1999-05-14",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "HEAD START (ENFIELD) LIMITED"
          }
        }
      },
      {
        "id": "8952675",
        "label": "HEAD START DAY NURSERIES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "8952675",
          "loaded": true,
          "extra": {
            "id": "8952675",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04373913",
              "nationality": null,
              "name": "HEAD START DAY NURSERIES LIMITED",
              "company_status_group": "Active",
              "id": 803968,
              "date_incorporated": "2002-02-14",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "HEAD START DAY NURSERIES LIMITED"
          }
        }
      },
      {
        "id": "9514600",
        "label": "FOUNTNURSERY LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "9514600",
          "loaded": true,
          "extra": {
            "id": "9514600",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "09241400",
              "nationality": null,
              "name": "FOUNTNURSERY LTD",
              "company_status_group": "Active",
              "id": 865270,
              "date_incorporated": "2014-09-30",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "FOUNTNURSERY LTD"
          }
        }
      },
      {
        "id": "9519926",
        "label": "HOLLY CORNER KINDERGARTEN LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "9519926",
          "loaded": true,
          "extra": {
            "id": "9519926",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03543115",
              "nationality": null,
              "name": "HOLLY CORNER KINDERGARTEN LIMITED",
              "company_status_group": "Active",
              "id": 859387,
              "date_incorporated": "1998-04-08",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "HOLLY CORNER KINDERGARTEN LIMITED"
          }
        }
      },
      {
        "id": "9584340",
        "label": "WESTGATE ARCHES LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "9584340",
          "loaded": true,
          "extra": {
            "id": "9584340",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "09219034",
              "nationality": null,
              "name": "WESTGATE ARCHES LTD",
              "company_status_group": "Active",
              "id": 864819,
              "date_incorporated": "2014-09-15",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "WESTGATE ARCHES LTD"
          }
        }
      },
      {
        "id": "9850589",
        "label": "FRESHFIELDS NURSERY SCHOOLS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "9850589",
          "loaded": true,
          "extra": {
            "id": "9850589",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04462378",
              "nationality": null,
              "name": "FRESHFIELDS NURSERY SCHOOLS LIMITED",
              "company_status_group": "Active",
              "id": 881931,
              "date_incorporated": "2002-06-17",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "FRESHFIELDS NURSERY SCHOOLS LIMITED"
          }
        }
      },
      {
        "id": "13755728",
        "label": "JUST IMAGINE DAY NURSERY LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "13755728",
          "loaded": true,
          "extra": {
            "id": "13755728",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "07916247",
              "nationality": null,
              "name": "JUST IMAGINE DAY NURSERY LIMITED",
              "company_status_group": "Active",
              "id": 1269713,
              "date_incorporated": "2012-01-19",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "JUST IMAGINE DAY NURSERY LIMITED"
          }
        }
      },
      {
        "id": "14769371",
        "label": "LAKEHOUSE NURSERIES LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "14769371",
          "loaded": true,
          "extra": {
            "id": "14769371",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "06821638",
              "nationality": null,
              "name": "LAKEHOUSE NURSERIES LTD",
              "company_status_group": "Active",
              "id": 1390164,
              "date_incorporated": "2009-02-17",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "LAKEHOUSE NURSERIES LTD"
          }
        }
      },
      {
        "id": "15603798",
        "label": "LITTLE MUNCHKINS MONTESSORI LTD.",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "15603798",
          "loaded": true,
          "extra": {
            "id": "15603798",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "09576751",
              "nationality": null,
              "name": "LITTLE MUNCHKINS MONTESSORI LTD.",
              "company_status_group": "Active",
              "id": 1472520,
              "date_incorporated": "2015-05-06",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "LITTLE MUNCHKINS MONTESSORI LTD."
          }
        }
      },
      {
        "id": "15738994",
        "label": "LITTLE GARDEN DAY NURSERIES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "15738994",
          "loaded": true,
          "extra": {
            "id": "15738994",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "02243993",
              "nationality": null,
              "name": "LITTLE GARDEN DAY NURSERIES LIMITED",
              "company_status_group": "Active",
              "id": 1471628,
              "date_incorporated": "1988-04-14",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "LITTLE GARDEN DAY NURSERIES LIMITED"
          }
        }
      },
      {
        "id": "15747672",
        "label": "LITTLE EXPLORERS DAY NURSERY LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "15747672",
          "loaded": true,
          "extra": {
            "id": "15747672",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "05488227",
              "nationality": null,
              "name": "LITTLE EXPLORERS DAY NURSERY LTD",
              "company_status_group": "Active",
              "id": 1471454,
              "date_incorporated": "2005-06-22",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "LITTLE EXPLORERS DAY NURSERY LTD"
          }
        }
      },
      {
        "id": "20303040",
        "label": "NURSERY ON THE GREEN LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "20303040",
          "loaded": true,
          "extra": {
            "id": "20303040",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04732835",
              "nationality": null,
              "name": "NURSERY ON THE GREEN LIMITED",
              "company_status_group": "Active",
              "id": 1929083,
              "date_incorporated": "2003-04-13",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "NURSERY ON THE GREEN LIMITED"
          }
        }
      },
      {
        "id": "20325664",
        "label": "NURSERY RHYMES (H.I.) LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "20325664",
          "loaded": true,
          "extra": {
            "id": "20325664",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "06279299",
              "nationality": null,
              "name": "NURSERY RHYMES (H.I.) LIMITED",
              "company_status_group": "Active",
              "id": 1929092,
              "date_incorporated": "2007-06-14",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "NURSERY RHYMES (H.I.) LIMITED"
          }
        }
      },
      {
        "id": "20338523",
        "label": "NURTURING CHILDCARE LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "20338523",
          "loaded": true,
          "extra": {
            "id": "20338523",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04947364",
              "nationality": null,
              "name": "NURTURING CHILDCARE LTD",
              "company_status_group": "Active",
              "id": 1929331,
              "date_incorporated": "2003-10-29",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "NURTURING CHILDCARE LTD"
          }
        }
      },
      {
        "id": "20450310",
        "label": "OAKLANDS MANAGEMENT SERVICES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "20450310",
          "loaded": true,
          "extra": {
            "id": "20450310",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03689864",
              "nationality": null,
              "name": "OAKLANDS MANAGEMENT SERVICES LIMITED",
              "company_status_group": "Active",
              "id": 1939022,
              "date_incorporated": "1998-12-29",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "OAKLANDS MANAGEMENT SERVICES LIMITED"
          }
        }
      },
      {
        "id": "49738963",
        "label": "FAMILY FIRST PRE SCHOOL LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "49738963",
          "loaded": true,
          "extra": {
            "id": "49738963",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "12632785",
              "nationality": null,
              "name": "FAMILY FIRST PRE SCHOOL LIMITED",
              "company_status_group": "Active",
              "id": 6889674,
              "date_incorporated": "2020-05-29",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "FAMILY FIRST PRE SCHOOL LIMITED"
          }
        }
      },
      {
        "id": "13604671",
        "label": "JUST IMAGINE NURSERIES - VANGE LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "13604671",
          "loaded": true,
          "extra": {
            "id": "13604671",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10448631",
              "nationality": null,
              "name": "JUST IMAGINE NURSERIES - VANGE LTD",
              "company_status_group": "Active",
              "id": 1269720,
              "date_incorporated": "2016-10-27",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "JUST IMAGINE NURSERIES - VANGE LTD"
          }
        }
      },
      {
        "id": "59939495",
        "label": "JUST IMAGINE NURSERIES - WICKFORD LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "59939495",
          "loaded": true,
          "extra": {
            "id": "59939495",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11049217",
              "nationality": null,
              "name": "JUST IMAGINE NURSERIES - WICKFORD LTD",
              "company_status_group": "Active",
              "id": 5239156,
              "date_incorporated": "2017-11-06",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "JUST IMAGINE NURSERIES - WICKFORD LTD"
          }
        }
      },
      {
        "id": "59881773",
        "label": "JUST IMAGINE NURSERIES - ALL SAINTS LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "59881773",
          "loaded": true,
          "extra": {
            "id": "59881773",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11198989",
              "nationality": null,
              "name": "JUST IMAGINE NURSERIES - ALL SAINTS LTD",
              "company_status_group": "Active",
              "id": 5315132,
              "date_incorporated": "2018-02-12",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "JUST IMAGINE NURSERIES - ALL SAINTS LTD"
          }
        }
      },
      {
        "id": "13701897",
        "label": "JUST IMAGINE NURSERIES - COLCHESTER ACADEMY LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "13701897",
          "loaded": true,
          "extra": {
            "id": "13701897",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10732952",
              "nationality": null,
              "name": "JUST IMAGINE NURSERIES - COLCHESTER ACADEMY LTD",
              "company_status_group": "Active",
              "id": 1269719,
              "date_incorporated": "2017-04-20",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "JUST IMAGINE NURSERIES - COLCHESTER ACADEMY LTD"
          }
        }
      },
      {
        "id": "35745538",
        "label": "WOODBERRY DAY NURSERY (SHOLING) LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "35745538",
          "loaded": true,
          "extra": {
            "id": "35745538",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "09820985",
              "nationality": null,
              "name": "WOODBERRY DAY NURSERY (SHOLING) LIMITED",
              "company_status_group": "Active",
              "id": 3399540,
              "date_incorporated": "2015-10-12",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "WOODBERRY DAY NURSERY (SHOLING) LIMITED"
          }
        }
      },
      {
        "id": "59953393",
        "label": "WOODBERRY DAY NURSERY (FAWLEY) LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "59953393",
          "loaded": true,
          "extra": {
            "id": "59953393",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11929228",
              "nationality": null,
              "name": "WOODBERRY DAY NURSERY (FAWLEY) LIMITED",
              "company_status_group": "Active",
              "id": 5464934,
              "date_incorporated": "2019-04-05",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "WOODBERRY DAY NURSERY (FAWLEY) LIMITED"
          }
        }
      },
      {
        "id": "35746991",
        "label": "WOODBERRY DAY NURSERY (PEARTREE) LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "35746991",
          "loaded": true,
          "extra": {
            "id": "35746991",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "06503705",
              "nationality": null,
              "name": "WOODBERRY DAY NURSERY (PEARTREE) LIMITED",
              "company_status_group": "Active",
              "id": 3399539,
              "date_incorporated": "2008-02-14",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "WOODBERRY DAY NURSERY (PEARTREE) LIMITED"
          }
        }
      },
      {
        "id": "59879111",
        "label": "WOODBERRY DAY NURSERY (WATERLOOVILLE) LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "59879111",
          "loaded": true,
          "extra": {
            "id": "59879111",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10774243",
              "nationality": null,
              "name": "WOODBERRY DAY NURSERY (WATERLOOVILLE) LTD",
              "company_status_group": "Active",
              "id": 5929907,
              "date_incorporated": "2017-05-17",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "WOODBERRY DAY NURSERY (WATERLOOVILLE) LTD"
          }
        }
      },
      {
        "id": "59885655",
        "label": "WOODBERRY DAY NURSERY IP LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "59885655",
          "loaded": true,
          "extra": {
            "id": "59885655",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "12344496",
              "nationality": null,
              "name": "WOODBERRY DAY NURSERY IP LIMITED",
              "company_status_group": "Active",
              "id": 6557016,
              "date_incorporated": "2019-12-02",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "WOODBERRY DAY NURSERY IP LIMITED"
          }
        }
      },
      {
        "id": "40653594",
        "label": "BUCKINGHAMSHIRE NURSERY SCHOOLS LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "40653594",
          "loaded": true,
          "extra": {
            "id": "40653594",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04532857",
              "nationality": null,
              "name": "BUCKINGHAMSHIRE NURSERY SCHOOLS LTD",
              "company_status_group": "Active",
              "id": 3893945,
              "date_incorporated": "2002-09-11",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "BUCKINGHAMSHIRE NURSERY SCHOOLS LTD"
          }
        }
      },
      {
        "id": "14148926",
        "label": "KIDS PLAY LTD.",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "14148926",
          "loaded": true,
          "extra": {
            "id": "14148926",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03757366",
              "nationality": null,
              "name": "KIDS PLAY LTD.",
              "company_status_group": "Active",
              "id": 1329711,
              "date_incorporated": "1999-04-21",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "KIDS PLAY LTD."
          }
        }
      },
      {
        "id": "5282302",
        "label": "FOOTSTEPS DAY NURSERIES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "5282302",
          "loaded": true,
          "extra": {
            "id": "5282302",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "05046074",
              "nationality": null,
              "name": "FOOTSTEPS DAY NURSERIES LIMITED",
              "company_status_group": "Active",
              "id": 479667,
              "date_incorporated": "2004-02-17",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "FOOTSTEPS DAY NURSERIES LIMITED"
          }
        }
      },
      {
        "id": "5312244",
        "label": "FOOTSTEPS STAFFORD LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "5312244",
          "loaded": true,
          "extra": {
            "id": "5312244",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10457714",
              "nationality": null,
              "name": "FOOTSTEPS STAFFORD LIMITED",
              "company_status_group": "Active",
              "id": 479703,
              "date_incorporated": "2016-11-02",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "FOOTSTEPS STAFFORD LIMITED"
          }
        }
      },
      {
        "id": "42562390",
        "label": "CHILD'S TIME LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "42562390",
          "loaded": true,
          "extra": {
            "id": "42562390",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "05577071",
              "nationality": null,
              "name": "CHILD'S TIME LTD",
              "company_status_group": "Active",
              "id": 4047938,
              "date_incorporated": "2005-09-28",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "CHILD'S TIME LTD"
          }
        }
      },
      {
        "id": "2810025",
        "label": "DAVIDSON-ROBERTS HOLDINGS LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "2810025",
          "loaded": true,
          "extra": {
            "id": "2810025",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11156391",
              "nationality": null,
              "name": "DAVIDSON-ROBERTS HOLDINGS LTD",
              "company_status_group": "Active",
              "id": 5981169,
              "date_incorporated": "2018-01-18",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "DAVIDSON-ROBERTS HOLDINGS LTD"
          }
        }
      },
      {
        "id": "2174076",
        "label": "DAVIDSON-ROBERTS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "2174076",
          "loaded": true,
          "extra": {
            "id": "2174076",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "05777772",
              "nationality": null,
              "name": "DAVIDSON-ROBERTS LIMITED",
              "company_status_group": "Active",
              "id": 3814085,
              "date_incorporated": "2006-04-11",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "DAVIDSON-ROBERTS LIMITED"
          }
        }
      },
      {
        "id": "2174029",
        "label": "ACRE WOOD DAY NURSERY (ARLESEY) LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "2174029",
          "loaded": true,
          "extra": {
            "id": "2174029",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "09779672",
              "nationality": null,
              "name": "ACRE WOOD DAY NURSERY (ARLESEY) LTD",
              "company_status_group": "Active",
              "id": 180258,
              "date_incorporated": "2015-09-16",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ACRE WOOD DAY NURSERY (ARLESEY) LTD"
          }
        }
      },
      {
        "id": "58509568",
        "label": "PIONEER TOPCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "58509568",
          "loaded": true,
          "extra": {
            "id": "58509568",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13638179",
              "nationality": null,
              "name": "PIONEER TOPCO LIMITED",
              "company_status_group": "Active",
              "id": 8210396,
              "date_incorporated": "2021-09-23",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PIONEER TOPCO LIMITED"
          }
        }
      },
      {
        "id": "58509454",
        "label": "PIONEER MIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "58509454",
          "loaded": true,
          "extra": {
            "id": "58509454",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13639126",
              "nationality": null,
              "name": "PIONEER MIDCO LIMITED",
              "company_status_group": "Active",
              "id": 8211800,
              "date_incorporated": "2021-09-23",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PIONEER MIDCO LIMITED"
          }
        }
      },
      {
        "id": "58511409",
        "label": "PIONEER FINCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "58511409",
          "loaded": true,
          "extra": {
            "id": "58511409",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13639406",
              "nationality": null,
              "name": "PIONEER FINCO LIMITED",
              "company_status_group": "Active",
              "id": 8211683,
              "date_incorporated": "2021-09-23",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PIONEER FINCO LIMITED"
          }
        }
      },
      {
        "id": "3475877",
        "label": "PIONEER BIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "3475877",
          "loaded": true,
          "extra": {
            "id": "3475877",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13639975",
              "nationality": null,
              "name": "PIONEER BIDCO LIMITED",
              "company_status_group": "Active",
              "id": 8212320,
              "date_incorporated": "2021-09-23",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PIONEER BIDCO LIMITED"
          }
        }
      },
      {
        "id": "17405304",
        "label": "MAY HOLDCO 2 LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "17405304",
          "loaded": true,
          "extra": {
            "id": "17405304",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13923446",
              "nationality": null,
              "name": "MAY HOLDCO 2 LIMITED",
              "company_status_group": "Active",
              "id": 8698971,
              "date_incorporated": "2022-02-17",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "MAY HOLDCO 2 LIMITED"
          }
        }
      },
      {
        "id": "26176902",
        "label": "AAB TEAM LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "26176902",
          "loaded": true,
          "extra": {
            "id": "26176902",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "08798552",
              "nationality": null,
              "name": "AAB TEAM LIMITED",
              "company_status_group": "Active",
              "id": 2513574,
              "date_incorporated": "2013-12-02",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB TEAM LIMITED"
          }
        }
      },
      {
        "id": "1355508",
        "label": "AAB PROFESSIONAL SERVICES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "1355508",
          "loaded": true,
          "extra": {
            "id": "1355508",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC708458",
              "nationality": null,
              "name": "AAB PROFESSIONAL SERVICES LIMITED",
              "company_status_group": "Active",
              "id": 8159165,
              "date_incorporated": "2021-09-02",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB PROFESSIONAL SERVICES LIMITED"
          }
        }
      },
      {
        "id": "76397529",
        "label": "ANDERSON ANDERSON & BROWN CONSULTING LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "76397529",
          "loaded": true,
          "extra": {
            "id": "76397529",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC590917",
              "nationality": null,
              "name": "ANDERSON ANDERSON & BROWN CONSULTING LIMITED",
              "company_status_group": "Active",
              "id": 6033545,
              "date_incorporated": "2018-03-09",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ANDERSON ANDERSON & BROWN CONSULTING LIMITED"
          }
        }
      },
      {
        "id": "1347887",
        "label": "AAB BUSINESS & TAX ADVISORY LLP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "1347887",
          "loaded": true,
          "extra": {
            "id": "1347887",
            "properties": {
              "company_type_group": "Limited Liability Partnership (LLP)",
              "company_number": "SO301668",
              "nationality": null,
              "name": "AAB BUSINESS & TAX ADVISORY LLP",
              "company_status_group": "Active",
              "id": 306584,
              "date_incorporated": "2007-12-20",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB BUSINESS & TAX ADVISORY LLP"
          }
        }
      },
      {
        "id": "3493912",
        "label": "AAB WEALTH LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "3493912",
          "loaded": true,
          "extra": {
            "id": "3493912",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC386504",
              "nationality": null,
              "name": "AAB WEALTH LIMITED",
              "company_status_group": "Active",
              "id": 306585,
              "date_incorporated": "2010-10-05",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB WEALTH LIMITED"
          }
        }
      },
      {
        "id": "9759227",
        "label": "AAB VIRTUAL FINANCE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "9759227",
          "loaded": true,
          "extra": {
            "id": "9759227",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC545996",
              "nationality": null,
              "name": "AAB VIRTUAL FINANCE LIMITED",
              "company_status_group": "Active",
              "id": 879883,
              "date_incorporated": "2016-09-22",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB VIRTUAL FINANCE LIMITED"
          }
        }
      },
      {
        "id": "9678710",
        "label": "FRENCH DUNCAN LLP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "9678710",
          "loaded": true,
          "extra": {
            "id": "9678710",
            "properties": {
              "company_type_group": "Limited Liability Partnership (LLP)",
              "company_number": "SO300004",
              "nationality": null,
              "name": "FRENCH DUNCAN LLP",
              "company_status_group": "Active",
              "id": 879886,
              "date_incorporated": "2001-05-01",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "FRENCH DUNCAN LLP"
          }
        }
      },
      {
        "id": "9818728",
        "label": "AAB PEOPLE CONSULTING LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "9818728",
          "loaded": true,
          "extra": {
            "id": "9818728",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC487207",
              "nationality": null,
              "name": "AAB PEOPLE CONSULTING LIMITED",
              "company_status_group": "Active",
              "id": 879885,
              "date_incorporated": "2014-09-22",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB PEOPLE CONSULTING LIMITED"
          }
        }
      },
      {
        "id": "22729639",
        "label": "AAB GROUP ACCOUNTANTS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "22729639",
          "loaded": true,
          "extra": {
            "id": "22729639",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "NI022968",
              "nationality": null,
              "name": "AAB GROUP ACCOUNTANTS LIMITED",
              "company_status_group": "Active",
              "id": 2164098,
              "date_incorporated": "1989-07-28",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB GROUP ACCOUNTANTS LIMITED"
          }
        }
      },
      {
        "id": "8634027",
        "label": "SAGARS ACCOUNTANTS LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "8634027",
          "loaded": true,
          "extra": {
            "id": "8634027",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03475109",
              "nationality": null,
              "name": "SAGARS ACCOUNTANTS LTD",
              "company_status_group": "Active",
              "id": 2513568,
              "date_incorporated": "1997-12-02",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SAGARS ACCOUNTANTS LTD"
          }
        }
      },
      {
        "id": "26245365",
        "label": "SAGARS CORPORATE FINANCE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "26245365",
          "loaded": true,
          "extra": {
            "id": "26245365",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "02249341",
              "nationality": null,
              "name": "SAGARS CORPORATE FINANCE LIMITED",
              "company_status_group": "Active",
              "id": 2513570,
              "date_incorporated": "1988-04-28",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SAGARS CORPORATE FINANCE LIMITED"
          }
        }
      },
      {
        "id": "26227244",
        "label": "SAGARS CONSULTING LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "26227244",
          "loaded": true,
          "extra": {
            "id": "26227244",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04004960",
              "nationality": null,
              "name": "SAGARS CONSULTING LIMITED",
              "company_status_group": "Active",
              "id": 2513569,
              "date_incorporated": "2000-05-31",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SAGARS CONSULTING LIMITED"
          }
        }
      },
      {
        "id": "26156457",
        "label": "SAGARS RESTRUCTURING LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "26156457",
          "loaded": true,
          "extra": {
            "id": "26156457",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04601409",
              "nationality": null,
              "name": "SAGARS RESTRUCTURING LTD",
              "company_status_group": "Active",
              "id": 2513573,
              "date_incorporated": "2002-11-26",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SAGARS RESTRUCTURING LTD"
          }
        }
      },
      {
        "id": "7157231",
        "label": "ELSTAN HR LTD.",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "7157231",
          "loaded": true,
          "extra": {
            "id": "7157231",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "09475521",
              "nationality": null,
              "name": "ELSTAN HR LTD.",
              "company_status_group": "Active",
              "id": 648085,
              "date_incorporated": "2015-03-06",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ELSTAN HR LTD."
          }
        }
      },
      {
        "id": "14313951",
        "label": "KILKEE FINANCIAL SERVICES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "14313951",
          "loaded": true,
          "extra": {
            "id": "14313951",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC235314",
              "nationality": null,
              "name": "KILKEE FINANCIAL SERVICES LIMITED",
              "company_status_group": "Active",
              "id": 1331560,
              "date_incorporated": "2002-08-13",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "KILKEE FINANCIAL SERVICES LIMITED"
          }
        }
      },
      {
        "id": "25230578",
        "label": "SYNERGY FINANCIAL PLANNING LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "25230578",
          "loaded": true,
          "extra": {
            "id": "25230578",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC316502",
              "nationality": null,
              "name": "SYNERGY FINANCIAL PLANNING LIMITED",
              "company_status_group": "Active",
              "id": 2412787,
              "date_incorporated": "2007-02-14",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SYNERGY FINANCIAL PLANNING LIMITED"
          }
        }
      },
      {
        "id": "6853869",
        "label": "HARDIE CALDWELL LLP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "6853869",
          "loaded": true,
          "extra": {
            "id": "6853869",
            "properties": {
              "company_type_group": "Limited Liability Partnership (LLP)",
              "company_number": "SO301168",
              "nationality": null,
              "name": "HARDIE CALDWELL LLP",
              "company_status_group": "Active",
              "id": 777740,
              "date_incorporated": "2006-12-21",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "HARDIE CALDWELL LLP"
          }
        }
      },
      {
        "id": "71765172",
        "label": "AAB CUSTOMS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "71765172",
          "loaded": true,
          "extra": {
            "id": "71765172",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11171480",
              "nationality": null,
              "name": "AAB CUSTOMS LIMITED",
              "company_status_group": "Active",
              "id": 5178002,
              "date_incorporated": "2018-01-26",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB CUSTOMS LIMITED"
          }
        }
      },
      {
        "id": "9817499",
        "label": "AAB BUSINESS SERVICES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "9817499",
          "loaded": true,
          "extra": {
            "id": "9817499",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC713613",
              "nationality": null,
              "name": "AAB BUSINESS SERVICES LIMITED",
              "company_status_group": "Active",
              "id": 8465369,
              "date_incorporated": "2021-10-29",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB BUSINESS SERVICES LIMITED"
          }
        }
      },
      {
        "id": "26844096",
        "label": "SEEHEARSPEAKUP LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "26844096",
          "loaded": true,
          "extra": {
            "id": "26844096",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC390049",
              "nationality": null,
              "name": "SEEHEARSPEAKUP LIMITED",
              "company_status_group": "Active",
              "id": 2574138,
              "date_incorporated": "2010-12-07",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SEEHEARSPEAKUP LIMITED"
          }
        }
      },
      {
        "id": "17405027",
        "label": "AAB INNOVATION TAXES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "17405027",
          "loaded": true,
          "extra": {
            "id": "17405027",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "08433475",
              "nationality": null,
              "name": "AAB INNOVATION TAXES LIMITED",
              "company_status_group": "Active",
              "id": 1636193,
              "date_incorporated": "2013-03-07",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB INNOVATION TAXES LIMITED"
          }
        }
      },
      {
        "id": "13431292",
        "label": "JOHN F DALY ASSOCIATES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "13431292",
          "loaded": true,
          "extra": {
            "id": "13431292",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "07202018",
              "nationality": null,
              "name": "JOHN F DALY ASSOCIATES LIMITED",
              "company_status_group": "Active",
              "id": 1238376,
              "date_incorporated": "2010-03-24",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "JOHN F DALY ASSOCIATES LIMITED"
          }
        }
      },
      {
        "id": "1355503",
        "label": "AAB EMPLOYER SOLUTIONS LLP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "1355503",
          "loaded": true,
          "extra": {
            "id": "1355503",
            "properties": {
              "company_type_group": "Limited Liability Partnership (LLP)",
              "company_number": "SO301673",
              "nationality": null,
              "name": "AAB EMPLOYER SOLUTIONS LLP",
              "company_status_group": "Active",
              "id": 115270,
              "date_incorporated": "2007-12-20",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB EMPLOYER SOLUTIONS LLP"
          }
        }
      },
      {
        "id": "1366693",
        "label": "AAB TRUSTEE COMPANY LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "1366693",
          "loaded": true,
          "extra": {
            "id": "1366693",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC443418",
              "nationality": null,
              "name": "AAB TRUSTEE COMPANY LIMITED",
              "company_status_group": "Active",
              "id": 117810,
              "date_incorporated": "2013-02-22",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB TRUSTEE COMPANY LIMITED"
          }
        }
      },
      {
        "id": "1386440",
        "label": "AAB NOMINEE COMPANY LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "1386440",
          "loaded": true,
          "extra": {
            "id": "1386440",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC390396",
              "nationality": null,
              "name": "AAB NOMINEE COMPANY LIMITED",
              "company_status_group": "Active",
              "id": 117790,
              "date_incorporated": "2010-12-15",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB NOMINEE COMPANY LIMITED"
          }
        }
      },
      {
        "id": "14174099",
        "label": "KER-AN PROPERTIES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "14174099",
          "loaded": true,
          "extra": {
            "id": "14174099",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC526799",
              "nationality": null,
              "name": "KER-AN PROPERTIES LIMITED",
              "company_status_group": "Active",
              "id": 1317373,
              "date_incorporated": "2016-02-12",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "KER-AN PROPERTIES LIMITED"
          }
        }
      },
      {
        "id": "7545363",
        "label": "AAB PROFESSIONAL TRUSTEES LLP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "7545363",
          "loaded": true,
          "extra": {
            "id": "7545363",
            "properties": {
              "company_type_group": "Limited Liability Partnership (LLP)",
              "company_number": "OC344077",
              "nationality": null,
              "name": "AAB PROFESSIONAL TRUSTEES LLP",
              "company_status_group": "Active",
              "id": 2513575,
              "date_incorporated": "2009-03-17",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB PROFESSIONAL TRUSTEES LLP"
          }
        }
      },
      {
        "id": "18353292",
        "label": "MJSM DEVELOPMENTS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "18353292",
          "loaded": true,
          "extra": {
            "id": "18353292",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC514131",
              "nationality": null,
              "name": "MJSM DEVELOPMENTS LIMITED",
              "company_status_group": "Active",
              "id": 1732162,
              "date_incorporated": "2015-08-27",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "MJSM DEVELOPMENTS LIMITED"
          }
        }
      },
      {
        "id": "20213989",
        "label": "NOVA TERRA PROPERTIES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "20213989",
          "loaded": true,
          "extra": {
            "id": "20213989",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC459397",
              "nationality": null,
              "name": "NOVA TERRA PROPERTIES LIMITED",
              "company_status_group": "Administration",
              "id": 1919239,
              "date_incorporated": "2013-09-17",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "NOVA TERRA PROPERTIES LIMITED"
          }
        }
      },
      {
        "id": "61414454",
        "label": "ST NICHOLAS PARK",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "61414454",
          "loaded": true,
          "extra": {
            "id": "61414454",
            "properties": {
              "company_type_group": "Unlimited Company (ULTD)",
              "company_number": "SC777911",
              "nationality": null,
              "name": "ST NICHOLAS PARK",
              "company_status_group": "Active",
              "id": 11606339,
              "date_incorporated": "2023-08-03",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ST NICHOLAS PARK"
          }
        }
      },
      {
        "id": "7545282",
        "label": "ERNEST GUNNER HOLDINGS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "7545282",
          "loaded": true,
          "extra": {
            "id": "7545282",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "00579845",
              "nationality": null,
              "name": "ERNEST GUNNER HOLDINGS LIMITED",
              "company_status_group": "Active",
              "id": 684826,
              "date_incorporated": "1957-03-12",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ERNEST GUNNER HOLDINGS LIMITED"
          }
        }
      },
      {
        "id": "30604996",
        "label": "THE AIRE AND OUSE FARMS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "30604996",
          "loaded": true,
          "extra": {
            "id": "30604996",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "00141618",
              "nationality": null,
              "name": "THE AIRE AND OUSE FARMS LIMITED",
              "company_status_group": "Active",
              "id": 2950841,
              "date_incorporated": "1915-09-20",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "THE AIRE AND OUSE FARMS LIMITED"
          }
        }
      },
      {
        "id": "9498221",
        "label": "DAVERN HOLDINGS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "9498221",
          "loaded": true,
          "extra": {
            "id": "9498221",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "00524996",
              "nationality": null,
              "name": "DAVERN HOLDINGS LIMITED",
              "company_status_group": "Active",
              "id": 3807830,
              "date_incorporated": "1953-10-24",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "DAVERN HOLDINGS LIMITED"
          }
        }
      },
      {
        "id": "9498081",
        "label": "HOLETCH HOLDINGS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "9498081",
          "loaded": true,
          "extra": {
            "id": "9498081",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "00252269",
              "nationality": null,
              "name": "HOLETCH HOLDINGS LIMITED",
              "company_status_group": "Active",
              "id": 857206,
              "date_incorporated": "1930-11-26",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "HOLETCH HOLDINGS LIMITED"
          }
        }
      },
      {
        "id": "39537107",
        "label": "DALES FARMS (SCOTLAND) LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "39537107",
          "loaded": true,
          "extra": {
            "id": "39537107",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC539053",
              "nationality": null,
              "name": "DALES FARMS (SCOTLAND) LIMITED",
              "company_status_group": "Active",
              "id": 3788012,
              "date_incorporated": "2016-06-28",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "DALES FARMS (SCOTLAND) LIMITED"
          }
        }
      },
      {
        "id": "23872151",
        "label": "AAB PEOPLE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "23872151",
          "loaded": true,
          "extra": {
            "id": "23872151",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC474970",
              "nationality": null,
              "name": "AAB PEOPLE LIMITED",
              "company_status_group": "Active",
              "id": 2263761,
              "date_incorporated": "2014-04-10",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB PEOPLE LIMITED"
          }
        }
      },
      {
        "id": "59997508",
        "label": "AAB PAYROLL LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "59997508",
          "loaded": true,
          "extra": {
            "id": "59997508",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC713667",
              "nationality": null,
              "name": "AAB PAYROLL LIMITED",
              "company_status_group": "Active",
              "id": 8466596,
              "date_incorporated": "2021-10-29",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB PAYROLL LIMITED"
          }
        }
      },
      {
        "id": "32337124",
        "label": "THINK PEOPLE CONSULTING LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "32337124",
          "loaded": true,
          "extra": {
            "id": "32337124",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "NI060956",
              "nationality": null,
              "name": "THINK PEOPLE CONSULTING LTD",
              "company_status_group": "Active",
              "id": 3058492,
              "date_incorporated": "2006-09-21",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "THINK PEOPLE CONSULTING LTD"
          }
        }
      },
      {
        "id": "156335737",
        "label": "AAB JV AUDIT LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "156335737",
          "loaded": true,
          "extra": {
            "id": "156335737",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC797354",
              "nationality": null,
              "name": "AAB JV AUDIT LIMITED",
              "company_status_group": "Active",
              "id": 12070857,
              "date_incorporated": "2024-02-01",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB JV AUDIT LIMITED"
          }
        }
      },
      {
        "id": "4835274",
        "label": "SAGARS LLP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "4835274",
          "loaded": true,
          "extra": {
            "id": "4835274",
            "properties": {
              "company_type_group": "Limited Liability Partnership (LLP)",
              "company_number": "OC310488",
              "nationality": null,
              "name": "SAGARS LLP",
              "company_status_group": "Active",
              "id": 2513572,
              "date_incorporated": "2004-12-10",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SAGARS LLP"
          }
        }
      },
      {
        "id": "149972682",
        "label": "A2 AND B LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "149972682",
          "loaded": true,
          "extra": {
            "id": "149972682",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC785065",
              "nationality": null,
              "name": "A2 AND B LIMITED",
              "company_status_group": "Active",
              "id": 11763384,
              "date_incorporated": "2023-10-05",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "A2 AND B LIMITED"
          }
        }
      },
      {
        "id": "59909641",
        "label": "AAB CORPORATE FINANCE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "59909641",
          "loaded": true,
          "extra": {
            "id": "59909641",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC713675",
              "nationality": null,
              "name": "AAB CORPORATE FINANCE LIMITED",
              "company_status_group": "Active",
              "id": 8466631,
              "date_incorporated": "2021-10-29",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB CORPORATE FINANCE LIMITED"
          }
        }
      },
      {
        "id": "59909702",
        "label": "AAB AUDIT LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "59909702",
          "loaded": true,
          "extra": {
            "id": "59909702",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC713660",
              "nationality": null,
              "name": "AAB AUDIT LIMITED",
              "company_status_group": "Active",
              "id": 8466568,
              "date_incorporated": "2021-10-29",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB AUDIT LIMITED"
          }
        }
      },
      {
        "id": "59964323",
        "label": "ANDERSON ANDERSON & BROWN WEALTH LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "59964323",
          "loaded": true,
          "extra": {
            "id": "59964323",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC713666",
              "nationality": null,
              "name": "ANDERSON ANDERSON & BROWN WEALTH LIMITED",
              "company_status_group": "Active",
              "id": 8466587,
              "date_incorporated": "2021-10-29",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ANDERSON ANDERSON & BROWN WEALTH LIMITED"
          }
        }
      },
      {
        "id": "59981981",
        "label": "FD PEOPLE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "59981981",
          "loaded": true,
          "extra": {
            "id": "59981981",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC713663",
              "nationality": null,
              "name": "FD PEOPLE LIMITED",
              "company_status_group": "Active",
              "id": 8466581,
              "date_incorporated": "2021-10-29",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "FD PEOPLE LIMITED"
          }
        }
      },
      {
        "id": "59984366",
        "label": "AAB GLOBAL MOBILITY LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "59984366",
          "loaded": true,
          "extra": {
            "id": "59984366",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC713685",
              "nationality": null,
              "name": "AAB GLOBAL MOBILITY LIMITED",
              "company_status_group": "Active",
              "id": 8466748,
              "date_incorporated": "2021-10-30",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB GLOBAL MOBILITY LIMITED"
          }
        }
      },
      {
        "id": "59997692",
        "label": "FRENCH DUNCAN (FINANCIAL CONTROLLER) LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "59997692",
          "loaded": true,
          "extra": {
            "id": "59997692",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC713673",
              "nationality": null,
              "name": "FRENCH DUNCAN (FINANCIAL CONTROLLER) LIMITED",
              "company_status_group": "Active",
              "id": 8466616,
              "date_incorporated": "2021-10-29",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "FRENCH DUNCAN (FINANCIAL CONTROLLER) LIMITED"
          }
        }
      },
      {
        "id": "59999191",
        "label": "AAB BUSINESS ADVISORY LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "59999191",
          "loaded": true,
          "extra": {
            "id": "59999191",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC713670",
              "nationality": null,
              "name": "AAB BUSINESS ADVISORY LIMITED",
              "company_status_group": "Active",
              "id": 8466608,
              "date_incorporated": "2021-10-29",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB BUSINESS ADVISORY LIMITED"
          }
        }
      },
      {
        "id": "60145030",
        "label": "AAB TAX LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "60145030",
          "loaded": true,
          "extra": {
            "id": "60145030",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC713668",
              "nationality": null,
              "name": "AAB TAX LIMITED",
              "company_status_group": "Active",
              "id": 8466672,
              "date_incorporated": "2021-10-29",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB TAX LIMITED"
          }
        }
      },
      {
        "id": "63742433",
        "label": "PURPOSE (HR & COACHING) LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "63742433",
          "loaded": true,
          "extra": {
            "id": "63742433",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC750370",
              "nationality": null,
              "name": "PURPOSE (HR & COACHING) LIMITED",
              "company_status_group": "Active",
              "id": 9310716,
              "date_incorporated": "2022-11-15",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PURPOSE (HR & COACHING) LIMITED"
          }
        }
      },
      {
        "id": "69159556",
        "label": "ANDERSON ANDERSON & BROWN LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "69159556",
          "loaded": true,
          "extra": {
            "id": "69159556",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC765044",
              "nationality": null,
              "name": "ANDERSON ANDERSON & BROWN LIMITED",
              "company_status_group": "Active",
              "id": 11316984,
              "date_incorporated": "2023-04-05",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ANDERSON ANDERSON & BROWN LIMITED"
          }
        }
      },
      {
        "id": "70037177",
        "label": "AAB ACCOUNTING LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "70037177",
          "loaded": true,
          "extra": {
            "id": "70037177",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC770967",
              "nationality": null,
              "name": "AAB ACCOUNTING LIMITED",
              "company_status_group": "Active",
              "id": 11449599,
              "date_incorporated": "2023-05-30",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AAB ACCOUNTING LIMITED"
          }
        }
      },
      {
        "id": "77312933",
        "label": "ANDERSON ANDERSON & BROWN AUDIT LLP",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "77312933",
          "loaded": true,
          "extra": {
            "id": "77312933",
            "properties": {
              "company_type_group": "Limited Liability Partnership (LLP)",
              "company_number": "SO306316",
              "nationality": null,
              "name": "ANDERSON ANDERSON & BROWN AUDIT LLP",
              "company_status_group": "Active",
              "id": 6193364,
              "date_incorporated": "2018-02-12",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ANDERSON ANDERSON & BROWN AUDIT LLP"
          }
        }
      },
      {
        "id": "216797",
        "label": "1851 HOLDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "216797",
          "loaded": true,
          "extra": {
            "id": "216797",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13966603",
              "nationality": null,
              "name": "1851 HOLDCO LIMITED",
              "company_status_group": "Active",
              "id": 8749802,
              "date_incorporated": "2022-03-09",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "1851 HOLDCO LIMITED"
          }
        }
      },
      {
        "id": "216761",
        "label": "1851 TECHNOLOGY CONSULTING LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "216761",
          "loaded": true,
          "extra": {
            "id": "216761",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "07305050",
              "nationality": null,
              "name": "1851 TECHNOLOGY CONSULTING LIMITED",
              "company_status_group": "Active",
              "id": 39250,
              "date_incorporated": "2010-07-06",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "1851 TECHNOLOGY CONSULTING LIMITED"
          }
        }
      },
      {
        "id": "48526453",
        "label": "KORU TOPCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "48526453",
          "loaded": true,
          "extra": {
            "id": "48526453",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "12351469",
              "nationality": null,
              "name": "KORU TOPCO LIMITED",
              "company_status_group": "Active",
              "id": 6565743,
              "date_incorporated": "2019-12-06",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "KORU TOPCO LIMITED"
          }
        }
      },
      {
        "id": "68836253",
        "label": "CLICK TOPCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "68836253",
          "loaded": true,
          "extra": {
            "id": "68836253",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14716298",
              "nationality": null,
              "name": "CLICK TOPCO LIMITED",
              "company_status_group": "Active",
              "id": 11244699,
              "date_incorporated": "2023-03-08",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "CLICK TOPCO LIMITED"
          }
        }
      },
      {
        "id": "55197400",
        "label": "MILO TOPCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "55197400",
          "loaded": true,
          "extra": {
            "id": "55197400",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13421241",
              "nationality": null,
              "name": "MILO TOPCO LIMITED",
              "company_status_group": "Active",
              "id": 7764717,
              "date_incorporated": "2021-05-26",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "MILO TOPCO LIMITED"
          }
        }
      },
      {
        "id": "51791770",
        "label": "SAXON TOPCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "51791770",
          "loaded": true,
          "extra": {
            "id": "51791770",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "12922835",
              "nationality": null,
              "name": "SAXON TOPCO LIMITED",
              "company_status_group": "Active",
              "id": 7218785,
              "date_incorporated": "2020-10-02",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SAXON TOPCO LIMITED"
          }
        }
      },
      {
        "id": "51791597",
        "label": "SAXON MIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "51791597",
          "loaded": true,
          "extra": {
            "id": "51791597",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "12922776",
              "nationality": null,
              "name": "SAXON MIDCO LIMITED",
              "company_status_group": "Active",
              "id": 7218764,
              "date_incorporated": "2020-10-02",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SAXON MIDCO LIMITED"
          }
        }
      },
      {
        "id": "51792120",
        "label": "SAXON FINCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "51792120",
          "loaded": true,
          "extra": {
            "id": "51792120",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "12922778",
              "nationality": null,
              "name": "SAXON FINCO LIMITED",
              "company_status_group": "Active",
              "id": 7218765,
              "date_incorporated": "2020-10-02",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SAXON FINCO LIMITED"
          }
        }
      },
      {
        "id": "2156252",
        "label": "SAXON BIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "2156252",
          "loaded": true,
          "extra": {
            "id": "2156252",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "12922821",
              "nationality": null,
              "name": "SAXON BIDCO LIMITED",
              "company_status_group": "Active",
              "id": 7218758,
              "date_incorporated": "2020-10-02",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SAXON BIDCO LIMITED"
          }
        }
      },
      {
        "id": "20994687",
        "label": "OPEX HOSTING LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "20994687",
          "loaded": true,
          "extra": {
            "id": "20994687",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04391287",
              "nationality": null,
              "name": "OPEX HOSTING LTD",
              "company_status_group": "Active",
              "id": 1992545,
              "date_incorporated": "2002-03-11",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "OPEX HOSTING LTD"
          }
        }
      },
      {
        "id": "2156187",
        "label": "ACRINAX LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "2156187",
          "loaded": true,
          "extra": {
            "id": "2156187",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "09826584",
              "nationality": null,
              "name": "ACRINAX LTD",
              "company_status_group": "Active",
              "id": 180493,
              "date_incorporated": "2015-10-15",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ACRINAX LTD"
          }
        }
      },
      {
        "id": "40854673",
        "label": "BUSINESS SYSTEMS (U.K.) LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "40854673",
          "loaded": true,
          "extra": {
            "id": "40854673",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "02199582",
              "nationality": null,
              "name": "BUSINESS SYSTEMS (U.K.) LIMITED",
              "company_status_group": "Active",
              "id": 3909611,
              "date_incorporated": "1987-11-27",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "BUSINESS SYSTEMS (U.K.) LIMITED"
          }
        }
      },
      {
        "id": "53600361",
        "label": "SONDERWELL MIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "53600361",
          "loaded": true,
          "extra": {
            "id": "53600361",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13184276",
              "nationality": null,
              "name": "SONDERWELL MIDCO LIMITED",
              "company_status_group": "Active",
              "id": 7499818,
              "date_incorporated": "2021-02-08",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SONDERWELL MIDCO LIMITED"
          }
        }
      },
      {
        "id": "53600233",
        "label": "SONDERWELL FINCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "53600233",
          "loaded": true,
          "extra": {
            "id": "53600233",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13188676",
              "nationality": null,
              "name": "SONDERWELL FINCO LIMITED",
              "company_status_group": "Active",
              "id": 7504588,
              "date_incorporated": "2021-02-09",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SONDERWELL FINCO LIMITED"
          }
        }
      },
      {
        "id": "5607260",
        "label": "SONDERWELL BIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "5607260",
          "loaded": true,
          "extra": {
            "id": "5607260",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13191584",
              "nationality": null,
              "name": "SONDERWELL BIDCO LIMITED",
              "company_status_group": "Active",
              "id": 7507708,
              "date_incorporated": "2021-02-10",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SONDERWELL BIDCO LIMITED"
          }
        }
      },
      {
        "id": "7444673",
        "label": "ENVIVA CARE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "7444673",
          "loaded": true,
          "extra": {
            "id": "7444673",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "07644652",
              "nationality": null,
              "name": "ENVIVA CARE LIMITED",
              "company_status_group": "Active",
              "id": 675400,
              "date_incorporated": "2011-05-24",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ENVIVA CARE LIMITED"
          }
        }
      },
      {
        "id": "5607036",
        "label": "BETTER HEALTHCARE SERVICES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "5607036",
          "loaded": true,
          "extra": {
            "id": "5607036",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03499632",
              "nationality": null,
              "name": "BETTER HEALTHCARE SERVICES LIMITED",
              "company_status_group": "Active",
              "id": 497277,
              "date_incorporated": "1998-01-27",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "BETTER HEALTHCARE SERVICES LIMITED"
          }
        }
      },
      {
        "id": "24029810",
        "label": "ARROW SUPPORT LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "24029810",
          "loaded": true,
          "extra": {
            "id": "24029810",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "06628645",
              "nationality": null,
              "name": "ARROW SUPPORT LIMITED",
              "company_status_group": "Active",
              "id": 2301192,
              "date_incorporated": "2008-06-24",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ARROW SUPPORT LIMITED"
          }
        }
      },
      {
        "id": "15339716",
        "label": "LIBERTATEM HEALTHCARE HOLDINGS LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "15339716",
          "loaded": true,
          "extra": {
            "id": "15339716",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11539989",
              "nationality": null,
              "name": "LIBERTATEM HEALTHCARE HOLDINGS LTD",
              "company_status_group": "Active",
              "id": 4978565,
              "date_incorporated": "2018-08-28",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "LIBERTATEM HEALTHCARE HOLDINGS LTD"
          }
        }
      },
      {
        "id": "15487625",
        "label": "LIBERTATEM HEALTHCARE GROUP LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "15487625",
          "loaded": true,
          "extra": {
            "id": "15487625",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10523191",
              "nationality": null,
              "name": "LIBERTATEM HEALTHCARE GROUP LIMITED",
              "company_status_group": "Active",
              "id": 1447480,
              "date_incorporated": "2016-12-13",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "LIBERTATEM HEALTHCARE GROUP LIMITED"
          }
        }
      },
      {
        "id": "5616051",
        "label": "ENVIVA COMPLEX CARE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "5616051",
          "loaded": true,
          "extra": {
            "id": "5616051",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03869350",
              "nationality": null,
              "name": "ENVIVA COMPLEX CARE LIMITED",
              "company_status_group": "Active",
              "id": 675406,
              "date_incorporated": "1999-11-01",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ENVIVA COMPLEX CARE LIMITED"
          }
        }
      },
      {
        "id": "5615859",
        "label": "DIVERSITY CARE SOLUTIONS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "5615859",
          "loaded": true,
          "extra": {
            "id": "5615859",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "07124727",
              "nationality": null,
              "name": "DIVERSITY CARE SOLUTIONS LIMITED",
              "company_status_group": "Active",
              "id": 510688,
              "date_incorporated": "2010-01-13",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "DIVERSITY CARE SOLUTIONS LIMITED"
          }
        }
      },
      {
        "id": "36788447",
        "label": "BECC: BESPOKE COMPLEX CARE SUPPORT LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "36788447",
          "loaded": true,
          "extra": {
            "id": "36788447",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "08257834",
              "nationality": null,
              "name": "BECC: BESPOKE COMPLEX CARE SUPPORT LIMITED",
              "company_status_group": "Active",
              "id": 3500276,
              "date_incorporated": "2012-10-17",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "BECC: BESPOKE COMPLEX CARE SUPPORT LIMITED"
          }
        }
      },
      {
        "id": "11828119",
        "label": "INVENT HEALTH LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "11828119",
          "loaded": true,
          "extra": {
            "id": "11828119",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC289550",
              "nationality": null,
              "name": "INVENT HEALTH LIMITED",
              "company_status_group": "Active",
              "id": 1084978,
              "date_incorporated": "2005-08-30",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "INVENT HEALTH LIMITED"
          }
        }
      },
      {
        "id": "55194721",
        "label": "MILO MIDCO 1 LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "55194721",
          "loaded": true,
          "extra": {
            "id": "55194721",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13421501",
              "nationality": null,
              "name": "MILO MIDCO 1 LIMITED",
              "company_status_group": "Active",
              "id": 7765230,
              "date_incorporated": "2021-05-26",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "MILO MIDCO 1 LIMITED"
          }
        }
      },
      {
        "id": "55194637",
        "label": "MILO FINCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "55194637",
          "loaded": true,
          "extra": {
            "id": "55194637",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13424584",
              "nationality": null,
              "name": "MILO FINCO LIMITED",
              "company_status_group": "Active",
              "id": 7768287,
              "date_incorporated": "2021-05-27",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "MILO FINCO LIMITED"
          }
        }
      },
      {
        "id": "11843256",
        "label": "I360 CYBER LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "11843256",
          "loaded": true,
          "extra": {
            "id": "11843256",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13424686",
              "nationality": null,
              "name": "I360 CYBER LTD",
              "company_status_group": "Active",
              "id": 7771739,
              "date_incorporated": "2021-05-27",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "I360 CYBER LTD"
          }
        }
      },
      {
        "id": "18626283",
        "label": "GLEELATION INVESTMENTS (UK) LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "18626283",
          "loaded": true,
          "extra": {
            "id": "18626283",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "07027918",
              "nationality": null,
              "name": "GLEELATION INVESTMENTS (UK) LIMITED",
              "company_status_group": "Active",
              "id": 1746402,
              "date_incorporated": "2009-09-23",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "GLEELATION INVESTMENTS (UK) LIMITED"
          }
        }
      },
      {
        "id": "41500359",
        "label": "MILO BIDCO UK LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "41500359",
          "loaded": true,
          "extra": {
            "id": "41500359",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13761214",
              "nationality": null,
              "name": "MILO BIDCO UK LIMITED",
              "company_status_group": "Active",
              "id": 8536051,
              "date_incorporated": "2021-11-23",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "MILO BIDCO UK LIMITED"
          }
        }
      },
      {
        "id": "11843024",
        "label": "GLEELATION UK LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "11843024",
          "loaded": true,
          "extra": {
            "id": "11843024",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "08083436",
              "nationality": null,
              "name": "GLEELATION UK LIMITED",
              "company_status_group": "Active",
              "id": 1072229,
              "date_incorporated": "2012-05-25",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "GLEELATION UK LIMITED"
          }
        }
      },
      {
        "id": "12567373",
        "label": "BLEND IT GROUP LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "12567373",
          "loaded": true,
          "extra": {
            "id": "12567373",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "07032529",
              "nationality": null,
              "name": "BLEND IT GROUP LIMITED",
              "company_status_group": "Active",
              "id": 3566936,
              "date_incorporated": "2009-09-28",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "BLEND IT GROUP LIMITED"
          }
        }
      },
      {
        "id": "12567036",
        "label": "CARETOWER LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "12567036",
          "loaded": true,
          "extra": {
            "id": "12567036",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "06807659",
              "nationality": null,
              "name": "CARETOWER LIMITED",
              "company_status_group": "Active",
              "id": 1156727,
              "date_incorporated": "2009-02-02",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "CARETOWER LIMITED"
          }
        }
      },
      {
        "id": "17846945",
        "label": "METADIGM LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "17846945",
          "loaded": true,
          "extra": {
            "id": "17846945",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "02344293",
              "nationality": null,
              "name": "METADIGM LIMITED",
              "company_status_group": "Active",
              "id": 1683196,
              "date_incorporated": "1989-02-07",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "METADIGM LIMITED"
          }
        }
      },
      {
        "id": "41500200",
        "label": "INTEGRITY360 LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "41500200",
          "loaded": true,
          "extra": {
            "id": "41500200",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03538529",
              "nationality": null,
              "name": "INTEGRITY360 LIMITED",
              "company_status_group": "Active",
              "id": 3970229,
              "date_incorporated": "1998-04-01",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "INTEGRITY360 LIMITED"
          }
        }
      },
      {
        "id": "63489116",
        "label": "PIVOT MIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "63489116",
          "loaded": true,
          "extra": {
            "id": "63489116",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14266976",
              "nationality": null,
              "name": "PIVOT MIDCO LIMITED",
              "company_status_group": "Active",
              "id": 9072171,
              "date_incorporated": "2022-08-01",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PIVOT MIDCO LIMITED"
          }
        }
      },
      {
        "id": "63489024",
        "label": "PIVOT FINCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "63489024",
          "loaded": true,
          "extra": {
            "id": "63489024",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14267074",
              "nationality": null,
              "name": "PIVOT FINCO LIMITED",
              "company_status_group": "Active",
              "id": 9072277,
              "date_incorporated": "2022-08-01",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PIVOT FINCO LIMITED"
          }
        }
      },
      {
        "id": "63489864",
        "label": "PIVOT BIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "63489864",
          "loaded": true,
          "extra": {
            "id": "63489864",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14267148",
              "nationality": null,
              "name": "PIVOT BIDCO LIMITED",
              "company_status_group": "Active",
              "id": 9072359,
              "date_incorporated": "2022-08-01",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PIVOT BIDCO LIMITED"
          }
        }
      },
      {
        "id": "27393363",
        "label": "SIGNIS HOLDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "27393363",
          "loaded": true,
          "extra": {
            "id": "27393363",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14302621",
              "nationality": null,
              "name": "SIGNIS HOLDCO LIMITED",
              "company_status_group": "Active",
              "id": 9110634,
              "date_incorporated": "2022-08-17",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SIGNIS HOLDCO LIMITED"
          }
        }
      },
      {
        "id": "24429819",
        "label": "REACTIVE STUDIOS LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "24429819",
          "loaded": true,
          "extra": {
            "id": "24429819",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "09928452",
              "nationality": null,
              "name": "REACTIVE STUDIOS LTD",
              "company_status_group": "Active",
              "id": 2333929,
              "date_incorporated": "2015-12-23",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "REACTIVE STUDIOS LTD"
          }
        }
      },
      {
        "id": "46750816",
        "label": "ONEPLAN SOFTWARE LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "46750816",
          "loaded": true,
          "extra": {
            "id": "46750816",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11526440",
              "nationality": null,
              "name": "ONEPLAN SOFTWARE LTD",
              "company_status_group": "Active",
              "id": 4797900,
              "date_incorporated": "2018-08-20",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ONEPLAN SOFTWARE LTD"
          }
        }
      },
      {
        "id": "57770246",
        "label": "ONEPLAN GROUP LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "57770246",
          "loaded": true,
          "extra": {
            "id": "57770246",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13527409",
              "nationality": null,
              "name": "ONEPLAN GROUP LTD",
              "company_status_group": "Active",
              "id": 8097477,
              "date_incorporated": "2021-07-23",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ONEPLAN GROUP LTD"
          }
        }
      },
      {
        "id": "23586500",
        "label": "SIGNIS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "23586500",
          "loaded": true,
          "extra": {
            "id": "23586500",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "08983010",
              "nationality": null,
              "name": "SIGNIS LIMITED",
              "company_status_group": "Active",
              "id": 2627335,
              "date_incorporated": "2014-04-07",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SIGNIS LIMITED"
          }
        }
      },
      {
        "id": "68839723",
        "label": "CLICK MIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "68839723",
          "loaded": true,
          "extra": {
            "id": "68839723",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14716505",
              "nationality": null,
              "name": "CLICK MIDCO LIMITED",
              "company_status_group": "Active",
              "id": 11244926,
              "date_incorporated": "2023-03-08",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "CLICK MIDCO LIMITED"
          }
        }
      },
      {
        "id": "68839675",
        "label": "CLICK FINCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "68839675",
          "loaded": true,
          "extra": {
            "id": "68839675",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14716744",
              "nationality": null,
              "name": "CLICK FINCO LIMITED",
              "company_status_group": "Active",
              "id": 11245187,
              "date_incorporated": "2023-03-08",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "CLICK FINCO LIMITED"
          }
        }
      },
      {
        "id": "28925589",
        "label": "POLARIS SOFTWARE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "28925589",
          "loaded": true,
          "extra": {
            "id": "28925589",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14716946",
              "nationality": null,
              "name": "POLARIS SOFTWARE LIMITED",
              "company_status_group": "Active",
              "id": 11245402,
              "date_incorporated": "2023-03-08",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "POLARIS SOFTWARE LIMITED"
          }
        }
      },
      {
        "id": "13413608",
        "label": "JML SOFTWARE SOLUTIONS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "13413608",
          "loaded": true,
          "extra": {
            "id": "13413608",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04944256",
              "nationality": null,
              "name": "JML SOFTWARE SOLUTIONS LIMITED",
              "company_status_group": "Active",
              "id": 1230860,
              "date_incorporated": "2003-10-27",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "JML SOFTWARE SOLUTIONS LIMITED"
          }
        }
      },
      {
        "id": "4017514",
        "label": "FARTHEST GATE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "4017514",
          "loaded": true,
          "extra": {
            "id": "4017514",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "08054704",
              "nationality": null,
              "name": "FARTHEST GATE LIMITED",
              "company_status_group": "Active",
              "id": 415287,
              "date_incorporated": "2012-05-02",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "FARTHEST GATE LIMITED"
          }
        }
      },
      {
        "id": "74039390",
        "label": "LEMNOS UK LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "74039390",
          "loaded": true,
          "extra": {
            "id": "74039390",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11861856",
              "nationality": null,
              "name": "LEMNOS UK LIMITED",
              "company_status_group": "Active",
              "id": 5570072,
              "date_incorporated": "2019-03-05",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "LEMNOS UK LIMITED"
          }
        }
      },
      {
        "id": "28925306",
        "label": "STARTRAQ LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "28925306",
          "loaded": true,
          "extra": {
            "id": "28925306",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04623760",
              "nationality": null,
              "name": "STARTRAQ LIMITED",
              "company_status_group": "Active",
              "id": 2782220,
              "date_incorporated": "2002-12-23",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "STARTRAQ LIMITED"
          }
        }
      },
      {
        "id": "4017426",
        "label": "EST SOLUTIONS LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "4017426",
          "loaded": true,
          "extra": {
            "id": "4017426",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "07587280",
              "nationality": null,
              "name": "EST SOLUTIONS LTD",
              "company_status_group": "Active",
              "id": 356638,
              "date_incorporated": "2011-04-01",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "EST SOLUTIONS LTD"
          }
        }
      },
      {
        "id": "48512282",
        "label": "KORU MIDCO 1 LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "48512282",
          "loaded": true,
          "extra": {
            "id": "48512282",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "12354203",
              "nationality": null,
              "name": "KORU MIDCO 1 LIMITED",
              "company_status_group": "Active",
              "id": 6696000,
              "date_incorporated": "2019-12-09",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "KORU MIDCO 1 LIMITED"
          }
        }
      },
      {
        "id": "48512111",
        "label": "KORU MIDCO 2 LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "48512111",
          "loaded": true,
          "extra": {
            "id": "48512111",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "12355063",
              "nationality": null,
              "name": "KORU MIDCO 2 LIMITED",
              "company_status_group": "Active",
              "id": 6696788,
              "date_incorporated": "2019-12-09",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "KORU MIDCO 2 LIMITED"
          }
        }
      },
      {
        "id": "2720676",
        "label": "KORU BIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "2720676",
          "loaded": true,
          "extra": {
            "id": "2720676",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "12355185",
              "nationality": null,
              "name": "KORU BIDCO LIMITED",
              "company_status_group": "Active",
              "id": 6620604,
              "date_incorporated": "2019-12-09",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "KORU BIDCO LIMITED"
          }
        }
      },
      {
        "id": "2720512",
        "label": "AIR IT LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "2720512",
          "loaded": true,
          "extra": {
            "id": "2720512",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "05543898",
              "nationality": null,
              "name": "AIR IT LIMITED",
              "company_status_group": "Active",
              "id": 230422,
              "date_incorporated": "2005-08-23",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "AIR IT LIMITED"
          }
        }
      },
      {
        "id": "19589008",
        "label": "NETSTAR GROUP LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "19589008",
          "loaded": true,
          "extra": {
            "id": "19589008",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "09984504",
              "nationality": null,
              "name": "NETSTAR GROUP LTD",
              "company_status_group": "Active",
              "id": 1858288,
              "date_incorporated": "2016-02-03",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "NETSTAR GROUP LTD"
          }
        }
      },
      {
        "id": "19706012",
        "label": "NETSTAR UK LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "19706012",
          "loaded": true,
          "extra": {
            "id": "19706012",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04470822",
              "nationality": null,
              "name": "NETSTAR UK LTD",
              "company_status_group": "Active",
              "id": 1858464,
              "date_incorporated": "2002-06-26",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "NETSTAR UK LTD"
          }
        }
      },
      {
        "id": "11369017",
        "label": "IITL LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "11369017",
          "loaded": true,
          "extra": {
            "id": "11369017",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "07094072",
              "nationality": null,
              "name": "IITL LIMITED",
              "company_status_group": "Active",
              "id": 1028166,
              "date_incorporated": "2009-12-03",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "IITL LIMITED"
          }
        }
      },
      {
        "id": "19554775",
        "label": "SOCONNECT LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "19554775",
          "loaded": true,
          "extra": {
            "id": "19554775",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC391588",
              "nationality": null,
              "name": "SOCONNECT LIMITED",
              "company_status_group": "Active",
              "id": 2702025,
              "date_incorporated": "2011-01-14",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SOCONNECT LIMITED"
          }
        }
      },
      {
        "id": "26646745",
        "label": "SCS TECHNOLOGY SOLUTIONS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "26646745",
          "loaded": true,
          "extra": {
            "id": "26646745",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04026644",
              "nationality": null,
              "name": "SCS TECHNOLOGY SOLUTIONS LIMITED",
              "company_status_group": "Active",
              "id": 2561029,
              "date_incorporated": "2000-07-04",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SCS TECHNOLOGY SOLUTIONS LIMITED"
          }
        }
      },
      {
        "id": "38389444",
        "label": "CONCISE TECHNOLOGIES GROUP LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "38389444",
          "loaded": true,
          "extra": {
            "id": "38389444",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "06749878",
              "nationality": null,
              "name": "CONCISE TECHNOLOGIES GROUP LIMITED",
              "company_status_group": "Active",
              "id": 3673141,
              "date_incorporated": "2008-11-14",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "CONCISE TECHNOLOGIES GROUP LIMITED"
          }
        }
      },
      {
        "id": "25256610",
        "label": "UPSTREAM GROUP LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "25256610",
          "loaded": true,
          "extra": {
            "id": "25256610",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11839764",
              "nationality": null,
              "name": "UPSTREAM GROUP LIMITED",
              "company_status_group": "Active",
              "id": 5432217,
              "date_incorporated": "2019-02-21",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "UPSTREAM GROUP LIMITED"
          }
        }
      },
      {
        "id": "20519784",
        "label": "VITAL TECHNOLOGY GROUP LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "20519784",
          "loaded": true,
          "extra": {
            "id": "20519784",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "06714498",
              "nationality": null,
              "name": "VITAL TECHNOLOGY GROUP LTD",
              "company_status_group": "Active",
              "id": 3269910,
              "date_incorporated": "2008-10-03",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "VITAL TECHNOLOGY GROUP LTD"
          }
        }
      },
      {
        "id": "2342558",
        "label": "SILVERBUG LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "2342558",
          "loaded": true,
          "extra": {
            "id": "2342558",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04541846",
              "nationality": null,
              "name": "SILVERBUG LIMITED",
              "company_status_group": "Active",
              "id": 2631819,
              "date_incorporated": "2002-09-23",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SILVERBUG LIMITED"
          }
        }
      },
      {
        "id": "26567609",
        "label": "SCORIA LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "26567609",
          "loaded": true,
          "extra": {
            "id": "26567609",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10062520",
              "nationality": null,
              "name": "SCORIA LIMITED",
              "company_status_group": "Active",
              "id": 2555505,
              "date_incorporated": "2016-03-14",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SCORIA LIMITED"
          }
        }
      },
      {
        "id": "11603921",
        "label": "ARTERI HOLDINGS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "11603921",
          "loaded": true,
          "extra": {
            "id": "11603921",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04145273",
              "nationality": null,
              "name": "ARTERI HOLDINGS LIMITED",
              "company_status_group": "Active",
              "id": 2303834,
              "date_incorporated": "2001-01-22",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ARTERI HOLDINGS LIMITED"
          }
        }
      },
      {
        "id": "6866058",
        "label": "NEXUS GS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "6866058",
          "loaded": true,
          "extra": {
            "id": "6866058",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03667913",
              "nationality": null,
              "name": "NEXUS GS LIMITED",
              "company_status_group": "Active",
              "id": 1877142,
              "date_incorporated": "1998-11-16",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "NEXUS GS LIMITED"
          }
        }
      },
      {
        "id": "17997715",
        "label": "MTL TECHNOLOGY LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "17997715",
          "loaded": true,
          "extra": {
            "id": "17997715",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04296970",
              "nationality": null,
              "name": "MTL TECHNOLOGY LIMITED",
              "company_status_group": "Active",
              "id": 1786459,
              "date_incorporated": "2001-10-01",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "MTL TECHNOLOGY LIMITED"
          }
        }
      },
      {
        "id": "17935423",
        "label": "MFG UK LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "17935423",
          "loaded": true,
          "extra": {
            "id": "17935423",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "06758260",
              "nationality": null,
              "name": "MFG UK LIMITED",
              "company_status_group": "Active",
              "id": 1692145,
              "date_incorporated": "2008-11-25",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "MFG UK LIMITED"
          }
        }
      },
      {
        "id": "17997429",
        "label": "MICROTRADING LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "17997429",
          "loaded": true,
          "extra": {
            "id": "17997429",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "01588792",
              "nationality": null,
              "name": "MICROTRADING LIMITED",
              "company_status_group": "Active",
              "id": 1699651,
              "date_incorporated": "1981-10-01",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "MICROTRADING LIMITED"
          }
        }
      },
      {
        "id": "11603606",
        "label": "INFOTECH SOLUTIONS (UK) LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "11603606",
          "loaded": true,
          "extra": {
            "id": "11603606",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03489385",
              "nationality": null,
              "name": "INFOTECH SOLUTIONS (UK) LIMITED",
              "company_status_group": "Active",
              "id": 1054794,
              "date_incorporated": "1998-01-07",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "INFOTECH SOLUTIONS (UK) LIMITED"
          }
        }
      },
      {
        "id": "11914700",
        "label": "IQUDA LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "11914700",
          "loaded": true,
          "extra": {
            "id": "11914700",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03792344",
              "nationality": null,
              "name": "IQUDA LTD",
              "company_status_group": "Active",
              "id": 1092577,
              "date_incorporated": "1999-06-21",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "IQUDA LTD"
          }
        }
      },
      {
        "id": "38735244",
        "label": "CORTEX INSIGHT LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "38735244",
          "loaded": true,
          "extra": {
            "id": "38735244",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "09366269",
              "nationality": null,
              "name": "CORTEX INSIGHT LTD",
              "company_status_group": "Active",
              "id": 3702629,
              "date_incorporated": "2014-12-23",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "CORTEX INSIGHT LTD"
          }
        }
      },
      {
        "id": "21612154",
        "label": "PARALOGIC NETWORKS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "21612154",
          "loaded": true,
          "extra": {
            "id": "21612154",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04569856",
              "nationality": null,
              "name": "PARALOGIC NETWORKS LIMITED",
              "company_status_group": "Active",
              "id": 2051798,
              "date_incorporated": "2002-10-22",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PARALOGIC NETWORKS LIMITED"
          }
        }
      },
      {
        "id": "25256394",
        "label": "RIVERBANK I.T. MANAGEMENT LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "25256394",
          "loaded": true,
          "extra": {
            "id": "25256394",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03487143",
              "nationality": null,
              "name": "RIVERBANK I.T. MANAGEMENT LIMITED",
              "company_status_group": "Active",
              "id": 2399962,
              "date_incorporated": "1997-12-30",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "RIVERBANK I.T. MANAGEMENT LIMITED"
          }
        }
      },
      {
        "id": "38391091",
        "label": "CONCISE TECHNOLOGIES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "38391091",
          "loaded": true,
          "extra": {
            "id": "38391091",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "03839017",
              "nationality": null,
              "name": "CONCISE TECHNOLOGIES LIMITED",
              "company_status_group": "Active",
              "id": 3673142,
              "date_incorporated": "1999-09-10",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "CONCISE TECHNOLOGIES LIMITED"
          }
        }
      },
      {
        "id": "28454790",
        "label": "SORTMYPC LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "28454790",
          "loaded": true,
          "extra": {
            "id": "28454790",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "SC356870",
              "nationality": null,
              "name": "SORTMYPC LIMITED",
              "company_status_group": "Active",
              "id": 2716823,
              "date_incorporated": "2009-03-19",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SORTMYPC LIMITED"
          }
        }
      },
      {
        "id": "59899019",
        "label": "RUBICONE MIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "59899019",
          "loaded": true,
          "extra": {
            "id": "59899019",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13705576",
              "nationality": null,
              "name": "RUBICONE MIDCO LIMITED",
              "company_status_group": "Active",
              "id": 8458052,
              "date_incorporated": "2021-10-26",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "RUBICONE MIDCO LIMITED"
          }
        }
      },
      {
        "id": "59898936",
        "label": "RUBICONE FINCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "59898936",
          "loaded": true,
          "extra": {
            "id": "59898936",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13706097",
              "nationality": null,
              "name": "RUBICONE FINCO LIMITED",
              "company_status_group": "Active",
              "id": 8458781,
              "date_incorporated": "2021-10-27",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "RUBICONE FINCO LIMITED"
          }
        }
      },
      {
        "id": "21178546",
        "label": "RUBICONE BIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "21178546",
          "loaded": true,
          "extra": {
            "id": "21178546",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13707224",
              "nationality": null,
              "name": "RUBICONE BIDCO LIMITED",
              "company_status_group": "Active",
              "id": 8459649,
              "date_incorporated": "2021-10-27",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "RUBICONE BIDCO LIMITED"
          }
        }
      },
      {
        "id": "21178016",
        "label": "ORBIS EDUCATION AND CARE TOPCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "21178016",
          "loaded": true,
          "extra": {
            "id": "21178016",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10315732",
              "nationality": null,
              "name": "ORBIS EDUCATION AND CARE TOPCO LIMITED",
              "company_status_group": "Active",
              "id": 1998734,
              "date_incorporated": "2016-08-05",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ORBIS EDUCATION AND CARE TOPCO LIMITED"
          }
        }
      },
      {
        "id": "10816039",
        "label": "SHINE BIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "10816039",
          "loaded": true,
          "extra": {
            "id": "10816039",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "14064702",
              "nationality": null,
              "name": "SHINE BIDCO LIMITED",
              "company_status_group": "Active",
              "id": 8853453,
              "date_incorporated": "2022-04-25",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SHINE BIDCO LIMITED"
          }
        }
      },
      {
        "id": "10815696",
        "label": "HOPEDALE CHILDREN AND FAMILY SERVICES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "10815696",
          "loaded": true,
          "extra": {
            "id": "10815696",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "07931653",
              "nationality": null,
              "name": "HOPEDALE CHILDREN AND FAMILY SERVICES LIMITED",
              "company_status_group": "Active",
              "id": 971028,
              "date_incorporated": "2012-02-01",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "HOPEDALE CHILDREN AND FAMILY SERVICES LIMITED"
          }
        }
      },
      {
        "id": "29616274",
        "label": "SUNLIGHT EDUCATION NUCLEUS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "29616274",
          "loaded": true,
          "extra": {
            "id": "29616274",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10673751",
              "nationality": null,
              "name": "SUNLIGHT EDUCATION NUCLEUS LIMITED",
              "company_status_group": "Active",
              "id": 2850014,
              "date_incorporated": "2017-03-16",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SUNLIGHT EDUCATION NUCLEUS LIMITED"
          }
        }
      },
      {
        "id": "60777696",
        "label": "POPPY FIELD SCHOOL LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "60777696",
          "loaded": true,
          "extra": {
            "id": "60777696",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "13832082",
              "nationality": null,
              "name": "POPPY FIELD SCHOOL LIMITED",
              "company_status_group": "Active",
              "id": 8602810,
              "date_incorporated": "2022-01-06",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "POPPY FIELD SCHOOL LIMITED"
          }
        }
      },
      {
        "id": "48059715",
        "label": "SEN 1 LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "48059715",
          "loaded": true,
          "extra": {
            "id": "48059715",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "11368293",
              "nationality": null,
              "name": "SEN 1 LIMITED",
              "company_status_group": "Active",
              "id": 5029197,
              "date_incorporated": "2018-05-17",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "SEN 1 LIMITED"
          }
        }
      },
      {
        "id": "21043543",
        "label": "ORBIS EDUCATION AND CARE MIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "21043543",
          "loaded": true,
          "extra": {
            "id": "21043543",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10315968",
              "nationality": null,
              "name": "ORBIS EDUCATION AND CARE MIDCO LIMITED",
              "company_status_group": "Active",
              "id": 1998733,
              "date_incorporated": "2016-08-08",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ORBIS EDUCATION AND CARE MIDCO LIMITED"
          }
        }
      },
      {
        "id": "21043384",
        "label": "ORBIS EDUCATION AND CARE FINCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "21043384",
          "loaded": true,
          "extra": {
            "id": "21043384",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10316464",
              "nationality": null,
              "name": "ORBIS EDUCATION AND CARE FINCO LIMITED",
              "company_status_group": "Active",
              "id": 1998731,
              "date_incorporated": "2016-08-08",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ORBIS EDUCATION AND CARE FINCO LIMITED"
          }
        }
      },
      {
        "id": "10371353",
        "label": "ORBIS EDUCATION AND CARE BIDCO LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "10371353",
          "loaded": true,
          "extra": {
            "id": "10371353",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "10317659",
              "nationality": null,
              "name": "ORBIS EDUCATION AND CARE BIDCO LIMITED",
              "company_status_group": "Active",
              "id": 2433405,
              "date_incorporated": "2016-08-08",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ORBIS EDUCATION AND CARE BIDCO LIMITED"
          }
        }
      },
      {
        "id": "10371192",
        "label": "ORBIS EDUCATION AND CARE SERVICES LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "10371192",
          "loaded": true,
          "extra": {
            "id": "10371192",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "09031289",
              "nationality": null,
              "name": "ORBIS EDUCATION AND CARE SERVICES LIMITED",
              "company_status_group": "Active",
              "id": 927778,
              "date_incorporated": "2014-05-09",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ORBIS EDUCATION AND CARE SERVICES LIMITED"
          }
        }
      },
      {
        "id": "7649890",
        "label": "ORBIS EDUCATION AND CARE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "7649890",
          "loaded": true,
          "extra": {
            "id": "7649890",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "05521347",
              "nationality": null,
              "name": "ORBIS EDUCATION AND CARE LIMITED",
              "company_status_group": "Active",
              "id": 1998732,
              "date_incorporated": "2005-07-28",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "ORBIS EDUCATION AND CARE LIMITED"
          }
        }
      },
      {
        "id": "7649713",
        "label": "GOWER LODGE (SWANSEA) LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "7649713",
          "loaded": true,
          "extra": {
            "id": "7649713",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "05233809",
              "nationality": null,
              "name": "GOWER LODGE (SWANSEA) LTD",
              "company_status_group": "Active",
              "id": 692610,
              "date_incorporated": "2004-09-16",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "GOWER LODGE (SWANSEA) LTD"
          }
        }
      },
      {
        "id": "21987028",
        "label": "PEMBROKESHIRE RESOURCE CENTRE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "21987028",
          "loaded": true,
          "extra": {
            "id": "21987028",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "04701044",
              "nationality": null,
              "name": "PEMBROKESHIRE RESOURCE CENTRE LIMITED",
              "company_status_group": "Active",
              "id": 2091031,
              "date_incorporated": "2003-03-18",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PEMBROKESHIRE RESOURCE CENTRE LIMITED"
          }
        }
      },
      {
        "id": "22868502",
        "label": "POLD HOLDINGS LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "22868502",
          "loaded": true,
          "extra": {
            "id": "22868502",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "07115571",
              "nationality": null,
              "name": "POLD HOLDINGS LIMITED",
              "company_status_group": "Active",
              "id": 2181987,
              "date_incorporated": "2010-01-04",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "POLD HOLDINGS LIMITED"
          }
        }
      },
      {
        "id": "23271034",
        "label": "PRIORITY CHILDCARE LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "23271034",
          "loaded": true,
          "extra": {
            "id": "23271034",
            "properties": {
              "company_type_group": "Limited Company (LTD)",
              "company_number": "07038051",
              "nationality": null,
              "name": "PRIORITY CHILDCARE LIMITED",
              "company_status_group": "Active",
              "id": 2224222,
              "date_incorporated": "2009-10-12",
              "is_company": 1,
              "psc_kind": null,
              "gender_name": null,
              "isRoot": 0
            },
            "labels": [
              "Company"
            ]
          },
          "className": "Company",
          "style": {
            "label": "PRIORITY CHILDCARE LIMITED"
          }
        }
      },
      {
        "id": "4789173",
        "label": "Mr Philip Michael Rattle",
        "fill": "#1dc564",
        "activeFill": "#347851",
        "icon": "/assets/zoomcharts/icons/Officer.png",
        "data": {
          "id": "4789173",
          "loaded": true,
          "extra": {
            "id": "4789173",
            "properties": {
              "company_type_group": null,
              "company_number": null,
              "nationality": "British",
              "name": "Mr Philip Michael Rattle",
              "company_status_group": null,
              "id": 1163022,
              "date_incorporated": null,
              "is_company": 0,
              "psc_kind": null,
              "gender_name": "Male",
              "isRoot": 0
            },
            "labels": [
              "Person"
            ]
          },
          "className": "Person",
          "fill": "#1dc564",
          "style": {
            "label": "Mr Philip Michael Rattle"
          }
        }
      },
      {
        "id": "3565407",
        "label": "Mr David Timothy Lonsdale",
        "fill": "#1dc564",
        "activeFill": "#347851",
        "icon": "/assets/zoomcharts/icons/Officer.png",
        "data": {
          "id": "3565407",
          "loaded": true,
          "extra": {
            "id": "3565407",
            "properties": {
              "company_type_group": null,
              "company_number": null,
              "nationality": "British",
              "name": "Mr David Timothy Lonsdale",
              "company_status_group": null,
              "id": 888230,
              "date_incorporated": null,
              "is_company": 0,
              "psc_kind": null,
              "gender_name": "Male",
              "isRoot": 0
            },
            "labels": [
              "Person"
            ]
          },
          "className": "Person",
          "fill": "#1dc564",
          "style": {
            "label": "Mr David Timothy Lonsdale"
          }
        }
      }
    ],
    "edges": [
      {
        "id": "241257842",
        "source": "1097509",
        "target": "157512609",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "196401403",
        "source": "1097509",
        "target": "77270647",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "194683193",
        "source": "1097509",
        "target": "76328503",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "183677592",
        "source": "1097509",
        "target": "72440875",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "166230150",
        "source": "1097509",
        "target": "64087137",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "165266760",
        "source": "1097509",
        "target": "63707969",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "165147508",
        "source": "1097509",
        "target": "63662309",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155990659",
        "source": "1097509",
        "target": "59927981",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "151930840",
        "source": "1097509",
        "target": "58401266",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "151369536",
        "source": "1097509",
        "target": "58186128",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "151239027",
        "source": "1097509",
        "target": "58135744",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "138673124",
        "source": "1097509",
        "target": "53474506",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "74144482",
        "source": "1097509",
        "target": "25849840",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "73947946",
        "source": "1097509",
        "target": "29038644",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "73939297",
        "source": "1097509",
        "target": "28986189",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "73932460",
        "source": "1097509",
        "target": "29037234",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "74142369",
        "source": "29037234",
        "target": "29117288",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "241257841",
        "source": "28986189",
        "target": "157512609",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "196401393",
        "source": "28986189",
        "target": "77270647",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "166230196",
        "source": "28986189",
        "target": "64087137",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "165266669",
        "source": "28986189",
        "target": "63707969",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "151930834",
        "source": "28986189",
        "target": "58401266",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "151369531",
        "source": "28986189",
        "target": "58186128",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "151239104",
        "source": "28986189",
        "target": "58135744",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "74771137",
        "source": "28986189",
        "target": "29351327",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "74276808",
        "source": "28986189",
        "target": "16685089",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "74142373",
        "source": "28986189",
        "target": "29117288",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "73800044",
        "source": "28986189",
        "target": "28987569",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "73796236",
        "source": "28986189",
        "target": "28986188",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "73939303",
        "source": "29038644",
        "target": "28986189",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "189826076",
        "source": "29038644",
        "target": "58248648",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "164535001",
        "source": "29038644",
        "target": "63363287",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "74142787",
        "source": "29038644",
        "target": "29038654",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "73985386",
        "source": "29038644",
        "target": "29057144",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "73984890",
        "source": "29038644",
        "target": "9482442",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "74276803",
        "source": "9482442",
        "target": "16685089",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "74771119",
        "source": "29057144",
        "target": "29351327",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "73935450",
        "source": "29038654",
        "target": "3601064",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "165678615",
        "source": "29038654",
        "target": "60274638",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "180920676",
        "source": "29038654",
        "target": "71206752",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "180407804",
        "source": "71206752",
        "target": "71206722",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "182417469",
        "source": "71206752",
        "target": "71966949",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "180535090",
        "source": "71206722",
        "target": "71255608",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "180603675",
        "source": "71255608",
        "target": "8450956",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "20585282",
        "source": "8450956",
        "target": "8415597",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "20494898",
        "source": "8415597",
        "target": "8415431",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "194683179",
        "source": "3601064",
        "target": "76328503",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "183677598",
        "source": "3601064",
        "target": "72440875",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "123977383",
        "source": "3601064",
        "target": "47567700",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "123137554",
        "source": "47567700",
        "target": "47302509",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "122434331",
        "source": "47302509",
        "target": "47171025",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "122098035",
        "source": "47171025",
        "target": "4251987",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "10215828",
        "source": "4251987",
        "target": "857648",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "74024427",
        "source": "4251987",
        "target": "29071915",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "75045610",
        "source": "4251987",
        "target": "29454102",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "75729927",
        "source": "4251987",
        "target": "29710662",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "80330633",
        "source": "4251987",
        "target": "31422666",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "107258546",
        "source": "4251987",
        "target": "11037174",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "183922434",
        "source": "72440875",
        "target": "72491674",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "183813671",
        "source": "72491674",
        "target": "72491548",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "183975088",
        "source": "72491548",
        "target": "21028235",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "52774475",
        "source": "21028235",
        "target": "21027914",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "79824892",
        "source": "21028235",
        "target": "16956699",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "42204638",
        "source": "16956699",
        "target": "16956339",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "80430982",
        "source": "16956699",
        "target": "9479159",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "23159615",
        "source": "9479159",
        "target": "9478859",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "23326608",
        "source": "9479159",
        "target": "9544744",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "53133552",
        "source": "21027914",
        "target": "21165577",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "194050016",
        "source": "76328503",
        "target": "76328436",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "194681984",
        "source": "76328436",
        "target": "76569596",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "194905644",
        "source": "76569596",
        "target": "31662431",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "80977562",
        "source": "31662431",
        "target": "3756137",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "9017514",
        "source": "3756137",
        "target": "3756016",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "103153775",
        "source": "3756137",
        "target": "39826722",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "239971669",
        "source": "63363287",
        "target": "157393865",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "164376681",
        "source": "63363287",
        "target": "63363285",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "239974421",
        "source": "157393865",
        "target": "157388007",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "240081291",
        "source": "157388007",
        "target": "157392763",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "239947839",
        "source": "157392763",
        "target": "157394138",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "15454493",
        "source": "157394138",
        "target": "11447727",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "28149811",
        "source": "11447727",
        "target": "11447637",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "79087715",
        "source": "11447727",
        "target": "11449380",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "154813140",
        "source": "11447727",
        "target": "5024320",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "156027267",
        "source": "11447727",
        "target": "30962374",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "28154004",
        "source": "11449380",
        "target": "11449037",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "179283435",
        "source": "58248648",
        "target": "51820911",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "177405054",
        "source": "58248648",
        "target": "69933558",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "174728056",
        "source": "58248648",
        "target": "68906211",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "164735317",
        "source": "58248648",
        "target": "63504014",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "151997643",
        "source": "58248648",
        "target": "58425014",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "151531562",
        "source": "58248648",
        "target": "58248635",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "168223736",
        "source": "63504014",
        "target": "64758183",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "167905604",
        "source": "64758183",
        "target": "64758118",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "189460211",
        "source": "64758183",
        "target": "73653378",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "186907289",
        "source": "73653378",
        "target": "73653263",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "189160013",
        "source": "73653263",
        "target": "48703688",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "126171555",
        "source": "48703688",
        "target": "1528851",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "55123284",
        "source": "1528851",
        "target": "21926624",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "16599209",
        "source": "1528851",
        "target": "36431470",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "397988985",
        "source": "1528851",
        "target": "27799848",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "164019780",
        "source": "1528851",
        "target": "63218002",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "156422117",
        "source": "1528851",
        "target": "60235625",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "156099161",
        "source": "1528851",
        "target": "2810030",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155696079",
        "source": "1528851",
        "target": "42562724",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155669785",
        "source": "1528851",
        "target": "59946985",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "150317904",
        "source": "1528851",
        "target": "5282454",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "123622620",
        "source": "1528851",
        "target": "14149349",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "109845865",
        "source": "1528851",
        "target": "42250493",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "109723244",
        "source": "1528851",
        "target": "42205095",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "108555285",
        "source": "1528851",
        "target": "40653784",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "104739077",
        "source": "1528851",
        "target": "40403496",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "95896335",
        "source": "1528851",
        "target": "37178130",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "92122970",
        "source": "1528851",
        "target": "35781622",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "80765957",
        "source": "1528851",
        "target": "31584047",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "80321111",
        "source": "1528851",
        "target": "31419061",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "79127556",
        "source": "1528851",
        "target": "30976975",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "75677212",
        "source": "1528851",
        "target": "29690998",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "74650903",
        "source": "1528851",
        "target": "29306457",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "67503021",
        "source": "1528851",
        "target": "26613837",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "64388316",
        "source": "1528851",
        "target": "25434420",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "61155762",
        "source": "1528851",
        "target": "24216696",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "58836458",
        "source": "1528851",
        "target": "23343871",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "57935616",
        "source": "1528851",
        "target": "23003035",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "57706919",
        "source": "1528851",
        "target": "22916243",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "3617247",
        "source": "1528851",
        "target": "1528742",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "5151492",
        "source": "1528851",
        "target": "2157641",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "17247008",
        "source": "1528851",
        "target": "7114975",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "19167183",
        "source": "1528851",
        "target": "7883082",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "21553728",
        "source": "1528851",
        "target": "8838899",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "21839890",
        "source": "1528851",
        "target": "8952675",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "23248970",
        "source": "1528851",
        "target": "9514600",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "23262573",
        "source": "1528851",
        "target": "9519926",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "23427339",
        "source": "1528851",
        "target": "9584340",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "24099732",
        "source": "1528851",
        "target": "9850589",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "34031712",
        "source": "1528851",
        "target": "13755728",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "36595899",
        "source": "1528851",
        "target": "14769371",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "38734105",
        "source": "1528851",
        "target": "15603798",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "39080524",
        "source": "1528851",
        "target": "15738994",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "39101685",
        "source": "1528851",
        "target": "15747672",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "50877313",
        "source": "1528851",
        "target": "20303040",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "50937392",
        "source": "1528851",
        "target": "20325664",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "50970972",
        "source": "1528851",
        "target": "20338523",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "51264086",
        "source": "1528851",
        "target": "20450310",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "128925777",
        "source": "15738994",
        "target": "49738963",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "33649157",
        "source": "1528742",
        "target": "13604671",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155649720",
        "source": "1528742",
        "target": "59939495",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155494579",
        "source": "1528742",
        "target": "59881773",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "33895302",
        "source": "1528742",
        "target": "13701897",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "92026572",
        "source": "22916243",
        "target": "35745538",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155687463",
        "source": "22916243",
        "target": "59953393",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "92030548",
        "source": "22916243",
        "target": "35746991",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155487497",
        "source": "22916243",
        "target": "59879111",
        "label": "Legal person person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155504991",
        "source": "22916243",
        "target": "59885655",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "105431183",
        "source": "40653784",
        "target": "40653594",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "35025477",
        "source": "14149349",
        "target": "14148926",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "12734534",
        "source": "5282454",
        "target": "5282302",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "12807951",
        "source": "5282302",
        "target": "5312244",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "110660101",
        "source": "42562724",
        "target": "42562390",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155646707",
        "source": "2810030",
        "target": "2810025",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "103091812",
        "source": "2810025",
        "target": "2174076",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "5190973",
        "source": "2174076",
        "target": "2174029",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "390916961",
        "source": "69933558",
        "target": "58509568",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "79026517",
        "source": "58509568",
        "target": "58509454",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "79028731",
        "source": "58509454",
        "target": "58511409",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "152232194",
        "source": "58511409",
        "target": "3475877",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "159424780",
        "source": "3475877",
        "target": "17405304",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "20636557",
        "source": "3475877",
        "target": "26176902",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "394045408",
        "source": "3475877",
        "target": "1355508",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "114862500",
        "source": "3475877",
        "target": "76397529",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "8338822",
        "source": "3475877",
        "target": "1347887",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "8383470",
        "source": "3475877",
        "target": "3493912",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "23869150",
        "source": "3475877",
        "target": "9759227",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "23872532",
        "source": "3475877",
        "target": "9678710",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "24019006",
        "source": "3475877",
        "target": "9818728",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "57218933",
        "source": "3475877",
        "target": "22729639",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "66349355",
        "source": "3475877",
        "target": "8634027",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "66531951",
        "source": "8634027",
        "target": "26245365",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "66485000",
        "source": "8634027",
        "target": "26227244",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "66298997",
        "source": "8634027",
        "target": "26156457",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "27188506",
        "source": "9818728",
        "target": "7157231",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "35446735",
        "source": "3493912",
        "target": "14313951",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "15721995",
        "source": "3493912",
        "target": "25230578",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "396349866",
        "source": "1347887",
        "target": "6853869",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "181877790",
        "source": "1347887",
        "target": "71765172",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155701754",
        "source": "1347887",
        "target": "9817499",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "68114638",
        "source": "1347887",
        "target": "26844096",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "43358764",
        "source": "1347887",
        "target": "17405027",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "33203367",
        "source": "1347887",
        "target": "13431292",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "3206830",
        "source": "1347887",
        "target": "1355503",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "3232412",
        "source": "1347887",
        "target": "1366693",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "3280281",
        "source": "1347887",
        "target": "1386440",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "35089414",
        "source": "1366693",
        "target": "14174099",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "391085595",
        "source": "1366693",
        "target": "7545363",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "45811743",
        "source": "1366693",
        "target": "18353292",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "50643013",
        "source": "1366693",
        "target": "20213989",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "205960713",
        "source": "1366693",
        "target": "61414454",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "18330958",
        "source": "7545363",
        "target": "7545282",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "78123745",
        "source": "7545363",
        "target": "30604996",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "102986970",
        "source": "7545363",
        "target": "9498221",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "23207387",
        "source": "9498221",
        "target": "9498081",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "23207388",
        "source": "7545282",
        "target": "9498081",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "102371276",
        "source": "14174099",
        "target": "39537107",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "60245592",
        "source": "1355503",
        "target": "23872151",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155803397",
        "source": "1355503",
        "target": "59997508",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "82801263",
        "source": "1355503",
        "target": "32337124",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "232522533",
        "source": "9817499",
        "target": "156335737",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "165951691",
        "source": "9817499",
        "target": "4835274",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "391094832",
        "source": "9817499",
        "target": "149972682",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155569794",
        "source": "9817499",
        "target": "59909641",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155569943",
        "source": "9817499",
        "target": "59909702",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155716949",
        "source": "9817499",
        "target": "59964323",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155763195",
        "source": "9817499",
        "target": "59981981",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155769790",
        "source": "9817499",
        "target": "59984366",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155803828",
        "source": "9817499",
        "target": "59997692",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155807680",
        "source": "9817499",
        "target": "59999191",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "156183601",
        "source": "9817499",
        "target": "60145030",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "165356332",
        "source": "9817499",
        "target": "63742433",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "175393798",
        "source": "9817499",
        "target": "69159556",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "177676175",
        "source": "9817499",
        "target": "70037177",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "165951746",
        "source": "1355508",
        "target": "4835274",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "196508519",
        "source": "1355508",
        "target": "77312933",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "8338814",
        "source": "1355508",
        "target": "1347887",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "160111071",
        "source": "17405304",
        "target": "216797",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "502056",
        "source": "216797",
        "target": "216761",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "203402402",
        "source": "51820911",
        "target": "48526453",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "174543916",
        "source": "51820911",
        "target": "68836253",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "168223741",
        "source": "51820911",
        "target": "64758183",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "165147535",
        "source": "51820911",
        "target": "63662309",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "143740481",
        "source": "51820911",
        "target": "55197400",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "138673097",
        "source": "51820911",
        "target": "53474506",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "134365046",
        "source": "51820911",
        "target": "51791770",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "134289057",
        "source": "51791770",
        "target": "51791597",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "134291149",
        "source": "51791597",
        "target": "51792120",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "134289989",
        "source": "51792120",
        "target": "2156252",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "52685621",
        "source": "2156252",
        "target": "20994687",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "5147937",
        "source": "2156252",
        "target": "2156187",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "105987297",
        "source": "2156252",
        "target": "40854673",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "139478545",
        "source": "53474506",
        "target": "53600361",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "139001670",
        "source": "53600361",
        "target": "53600233",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "139072610",
        "source": "53600233",
        "target": "5607260",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "18078148",
        "source": "5607260",
        "target": "7444673",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "53673597",
        "source": "5607260",
        "target": "5607036",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "60662481",
        "source": "5607260",
        "target": "24029810",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "123742058",
        "source": "5607260",
        "target": "15339716",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "38435143",
        "source": "15339716",
        "target": "15487625",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "18102801",
        "source": "7444673",
        "target": "5616051",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "13554286",
        "source": "5616051",
        "target": "5615859",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "132358652",
        "source": "5616051",
        "target": "36788447",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "29126080",
        "source": "5616051",
        "target": "11828119",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "143177548",
        "source": "55197400",
        "target": "55194721",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "143170514",
        "source": "55194721",
        "target": "55194637",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "143543475",
        "source": "55194637",
        "target": "11843256",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "205921717",
        "source": "11843256",
        "target": "18626283",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "156832533",
        "source": "11843256",
        "target": "41500359",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "29164055",
        "source": "11843256",
        "target": "11843024",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "205902235",
        "source": "11843024",
        "target": "12567373",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "31010302",
        "source": "12567373",
        "target": "12567036",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "44507174",
        "source": "12567373",
        "target": "17846945",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "44507205",
        "source": "12567373",
        "target": "17846945",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "107776050",
        "source": "41500359",
        "target": "41500200",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "165149575",
        "source": "63662309",
        "target": "63489116",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "164697043",
        "source": "63489116",
        "target": "63489024",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "164699198",
        "source": "63489024",
        "target": "63489864",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "165709848",
        "source": "63489864",
        "target": "27393363",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "9329656",
        "source": "63489864",
        "target": "24429819",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "121027789",
        "source": "24429819",
        "target": "46750816",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "205641432",
        "source": "24429819",
        "target": "57770246",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "106820754",
        "source": "27393363",
        "target": "23586500",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "174703603",
        "source": "68836253",
        "target": "68839723",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "174552911",
        "source": "68839723",
        "target": "68839675",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "174696562",
        "source": "68839675",
        "target": "28925589",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "401289608",
        "source": "28925589",
        "target": "13413608",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "390383767",
        "source": "28925589",
        "target": "4017514",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "187942321",
        "source": "28925589",
        "target": "74039390",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "73634596",
        "source": "28925589",
        "target": "28925306",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "205955576",
        "source": "4017514",
        "target": "4017426",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "125700157",
        "source": "48526453",
        "target": "48512282",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "125662257",
        "source": "48512282",
        "target": "48512111",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "204317484",
        "source": "48512111",
        "target": "2720676",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "6508379",
        "source": "2720676",
        "target": "2720512",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "49020497",
        "source": "2720676",
        "target": "19589008",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "49323401",
        "source": "19589008",
        "target": "19706012",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "27951137",
        "source": "2720512",
        "target": "11369017",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "687075",
        "source": "2720512",
        "target": "19554775",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "237154790",
        "source": "2720512",
        "target": "26646745",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "49871416",
        "source": "2720512",
        "target": "38389444",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "185440461",
        "source": "2720512",
        "target": "25256610",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "88050034",
        "source": "2720512",
        "target": "20519784",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "69408013",
        "source": "2720512",
        "target": "2342558",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "67377173",
        "source": "2720512",
        "target": "26567609",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "61083255",
        "source": "2720512",
        "target": "11603921",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "49419228",
        "source": "2720512",
        "target": "6866058",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "46966711",
        "source": "2720512",
        "target": "17997715",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "44736324",
        "source": "2720512",
        "target": "17935423",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "329369630",
        "source": "17997715",
        "target": "17997429",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "28548893",
        "source": "11603921",
        "target": "11603606",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "29349419",
        "source": "2342558",
        "target": "11914700",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "100172167",
        "source": "2342558",
        "target": "38735244",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "54301720",
        "source": "2342558",
        "target": "21612154",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "63914905",
        "source": "25256610",
        "target": "25256394",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "99216998",
        "source": "38389444",
        "target": "38391091",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "72400021",
        "source": "19554775",
        "target": "28454790",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "73800052",
        "source": "25849840",
        "target": "28987569",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155618371",
        "source": "59927981",
        "target": "59899019",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155541514",
        "source": "59899019",
        "target": "59898936",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "155597055",
        "source": "59898936",
        "target": "21178546",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "53166145",
        "source": "21178546",
        "target": "21178016",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "161772672",
        "source": "21178546",
        "target": "10816039",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "26543087",
        "source": "10816039",
        "target": "10815696",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "75476885",
        "source": "10816039",
        "target": "29616274",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "157815335",
        "source": "10816039",
        "target": "60777696",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "124457489",
        "source": "29616274",
        "target": "48059715",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "53164753",
        "source": "21178016",
        "target": "21043543",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "52814496",
        "source": "21043543",
        "target": "21043384",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "64368727",
        "source": "21043384",
        "target": "10371353",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "25414029",
        "source": "10371353",
        "target": "10371192",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "52760705",
        "source": "10371353",
        "target": "7649890",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "18588984",
        "source": "7649890",
        "target": "7649713",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "77550552",
        "source": "7649890",
        "target": "21987028",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "57581790",
        "source": "7649890",
        "target": "22868502",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "58642817",
        "source": "22868502",
        "target": "23271034",
        "label": "Corporate entity person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "284665206",
        "source": "4789173",
        "target": "1097509",
        "label": "Individual person with significant control",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "284665205",
        "source": "3565407",
        "target": "1097509",
        "label": "Individual person with significant control",
        "backgroundColor": "#00A2A1"
      }
    ]
  }
  return <GraphCanvas
    theme={theme}
    layoutType="treeTd2d"
    draggable
    cameraMode="pan"
    edgeLabelPosition="natural"
    edgeInterpolation='linear'    
    labelType="all"
    nodes={testData.nodes}
    edges={testData.edges}
    edgeArrowPosition="none"
    renderNode={({ node, ...rest }) => (
      <SphereWithIcon {...rest} node={node} image={node.icon || ""} />
    )}
    layoutOverrides={{
      nodeLevelRatio: 2.5,
      linkDistance: 500,
      nodeStrength: -3000,
      // clusterStrength: 1,
      // forceLinkStrength: 1,
      // forceLinkDistance: 300,
      // nodeSeparation: 100,

    }}
  />
}

export const Connection = () => {
  const theme: Theme = {
    canvas: {
      background: "#fff",
    },
    node: {
      fill: "#000",
      activeFill: "#1de9ac",
      opacity: 1,
      selectedOpacity: 1,
      inactiveOpacity: 1,
      // showRing: false,
      label: {
        color: "#FFF",
        activeColor: "#fafafa",
        fontSize: 4,
        ellipsis: 0,
        maxWidth: 50,
        backgroundColor: "#000",
        borderRadius: 2,
      },
    },
    edge: {
      fill: "#d8e6ea",
      activeFill: "#1DE9AC",
      opacity: 0.6,
      selectedOpacity: 1,
      inactiveOpacity: 1,
      label: {
        color: "#FFF",
        activeColor: "#fafafa",
        fontSize: 4,
        ellipsis: 100,
        maxWidth: 50,
        backgroundColor: "#00a2a1",
        borderRadius: 4,
      },
    },
    lasso: {
      background: "#fff",
      border: "none",
    },
    arrow: {
      fill: "#808080",
      activeFill: "#1de9ac",
    },
    ring: {
      fill: "red",
      activeFill: "red",

    },
  };
  const testData = {
    "nodes": [
      {
        "id": "4874442",
        "label": "FIDUCIARY SETTLEMENTS LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "4874442",
          "loaded": true,
          "extra": {
            "id": "4874442",
            "elementId": "4:9143ec59-4bd2-40a1-b4c2-3921e2aa8d4f:4874442",
            "labels": [
              "Company"
            ],
            "properties": {
              "company_type": "ltd",
              "date_neo4j_sync": "2024-07-24T05:55:07.874940288Z",
              "address_posttown": "Croydon",
              "latitude": 51.37501907348633,
              "next_accounts_due": "2025-07-31",
              "company_status_group": "Active",
              "date_incorporated": "2012-10-24",
              "last_confirmation_date": "2024-04-25",
              "next_confirmation_due": "2025-05-09",
              "address_line2": "Dingwall Road",
              "address_line1": "6th Floor, Amp House",
              "company_status": "active",
              "id": 433593,
              "last_accounts_type": "micro-entity",
              "date_last_updated": "2024-06-27T13:30:29.110Z",
              "longitude": -0.09498199820518494,
              "company_status_display": "Active",
              "address_string": "6th Floor, Amp House, Dingwall Road, Croydon, England, CR0 2LX",
              "id_postcode_mapping": 738466,
              "address_country": "England",
              "coordinates": {
                "type": "Point",
                "coordinates": [
                  -0.09498199820518494,
                  51.37501907348633
                ],
                "crs": {
                  "srid": 4326,
                  "name": "wgs-84",
                  "type": "link",
                  "properties": {
                    "href": "https://spatialreference.org/ref/epsg/4326/ogcwkt/",
                    "type": "ogcwkt"
                  }
                }
              },
              "address_postcode": "CR0 2LX",
              "company_type_display": "Private limited company",
              "company_type_group": "Limited Company (LTD)",
              "last_accounts_date": "2023-10-31",
              "company_number": "08266173",
              "name": "FIDUCIARY SETTLEMENTS LTD",
              "is_company": 1,
              "isRoot": 0
            }
          },
          "className": "Company",
          "style": {
            "label": "FIDUCIARY SETTLEMENTS LTD"
          }
        }
      },
      {
        "id": "157918667",
        "label": "Mr Yomtov Eliezer Jacobs",
        "fill": "#1dc564",
        "activeFill": "#347851",
        "icon": "/assets/zoomcharts/icons/Officer.png",
        "data": {
          "id": "157918667",
          "loaded": true,
          "extra": {
            "id": "157918667",
            "elementId": "4:9143ec59-4bd2-40a1-b4c2-3921e2aa8d4f:157918667",
            "labels": [
              "Person"
            ],
            "properties": {
              "date_neo4j_sync": "2024-07-24T08:54:00.658571802Z",
              "date_of_birth": "1970-10-01",
              "birth_month": 10,
              "last_name": "Jacobs",
              "title": "Mr",
              "middle_name": "Eliezer",
              "birth_year": 1970,
              "gender_name": "Male",
              "total_entity_count": 11,
              "current": 1,
              "nationality": "British",
              "is_bobble": 1,
              "name": "Mr Yomtov Eliezer Jacobs",
              "honours": "",
              "id": 304,
              "first_name_initial": "Y",
              "is_company": 0,
              "first_name": "Yomtov",
              "date_last_updated": "2024-07-18T19:54:03.053Z",
              "isRoot": 0
            }
          },
          "className": "Person",
          "fill": "#1dc564",
          "style": {
            "label": "Mr Yomtov Eliezer Jacobs"
          }
        }
      },
      {
        "id": "7320792",
        "label": "ENDEAVOUR CORPORATE LTD",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "7320792",
          "loaded": true,
          "extra": {
            "id": "7320792",
            "elementId": "4:9143ec59-4bd2-40a1-b4c2-3921e2aa8d4f:7320792",
            "labels": [
              "Company"
            ],
            "properties": {
              "company_type": "ltd",
              "address_posttown": "Ashby-De-La-Zouch",
              "date_neo4j_sync": "2024-07-24T07:56:26.121220764Z",
              "latitude": 52.74614334106445,
              "next_accounts_due": "2024-09-30",
              "company_status_group": "Administration",
              "date_incorporated": "2009-08-07",
              "last_confirmation_date": "2023-08-07",
              "next_confirmation_due": "2024-08-21",
              "address_line2": "South Street",
              "address_line1": "C/O Frost Group Limited, Court House The Old Police Station",
              "company_status": "liquidation",
              "id": 663023,
              "last_accounts_type": "micro-entity",
              "date_last_updated": "2024-06-20T10:00:33.540Z",
              "longitude": -1.4704630374908447,
              "company_status_display": "Liquidation",
              "address_string": "C/O Frost Group Limited, Court House The Old Police Station, South Street, Ashby-De-La-Zouch, Leicestershire, LE65 1BR",
              "id_postcode_mapping": 44932,
              "coordinates": {
                "type": "Point",
                "coordinates": [
                  -1.4704630374908447,
                  52.74614334106445
                ],
                "crs": {
                  "srid": 4326,
                  "name": "wgs-84",
                  "type": "link",
                  "properties": {
                    "href": "https://spatialreference.org/ref/epsg/4326/ogcwkt/",
                    "type": "ogcwkt"
                  }
                }
              },
              "address_postcode": "LE65 1BR",
              "company_type_display": "Private limited company",
              "address_county": "Leicestershire",
              "company_type_group": "Limited Company (LTD)",
              "last_accounts_date": "2022-12-31",
              "company_number": "06984563",
              "name": "ENDEAVOUR CORPORATE LTD",
              "is_company": 1,
              "isRoot": 0
            }
          },
          "className": "Company",
          "style": {
            "label": "ENDEAVOUR CORPORATE LTD"
          }
        }
      },
      {
        "id": "157918165",
        "label": "John George Cushing",
        "fill": "#1dc564",
        "activeFill": "#347851",
        "icon": "/assets/zoomcharts/icons/Officer.png",
        "data": {
          "id": "157918165",
          "loaded": true,
          "extra": {
            "id": "157918165",
            "elementId": "4:9143ec59-4bd2-40a1-b4c2-3921e2aa8d4f:157918165",
            "labels": [
              "Person"
            ],
            "properties": {
              "date_neo4j_sync": "2024-07-24T05:55:07.920072922Z",
              "birth_month": 2,
              "date_of_birth": "1979-02-01",
              "last_name": "Cushing",
              "middle_name": "George",
              "title": "",
              "gender_name": "Male",
              "birth_year": 1979,
              "total_entity_count": 26,
              "current": 1,
              "nationality": "British",
              "is_bobble": 0,
              "name": "John George Cushing",
              "honours": "",
              "id": 4029,
              "first_name_initial": "J",
              "is_company": 0,
              "first_name": "John",
              "date_last_updated": "2024-07-18T19:55:12.510Z",
              "isRoot": 0
            }
          },
          "className": "Person",
          "fill": "#1dc564",
          "style": {
            "label": "John George Cushing"
          }
        }
      },
      {
        "id": "487883",
        "label": "44SOUTH LIMITED",
        "fill": "red",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "487883",
          "loaded": true,
          "extra": {
            "id": "487883",
            "elementId": "4:9143ec59-4bd2-40a1-b4c2-3921e2aa8d4f:487883",
            "labels": [
              "Company"
            ],
            "properties": {
              "company_type": "ltd",
              "date_neo4j_sync": "2024-07-23T16:33:22.327453788Z",
              "address_posttown": "Harlow",
              "latitude": 51.74839401245117,
              "next_accounts_due": "2025-02-28",
              "company_status_group": "Active",
              "date_incorporated": "2013-05-10",
              "last_confirmation_date": "2024-05-10",
              "next_confirmation_due": "2025-05-24",
              "address_line1": "51 Moorfield",
              "company_status": "active",
              "id": 51487,
              "date_last_updated": "2024-05-24T14:50:38.760Z",
              "longitude": 0.09091000258922577,
              "company_status_display": "Active",
              "address_string": "51 Moorfield, Harlow, Essex, CM18 7QF",
              "id_postcode_mapping": 1831417,
              "coordinates": {
                "type": "Point",
                "coordinates": [
                  0.09091000258922577,
                  51.74839401245117
                ],
                "crs": {
                  "srid": 4326,
                  "name": "wgs-84",
                  "type": "link",
                  "properties": {
                    "href": "https://spatialreference.org/ref/epsg/4326/ogcwkt/",
                    "type": "ogcwkt"
                  }
                }
              },
              "address_postcode": "CM18 7QF",
              "company_type_display": "Private limited company",
              "address_county": "Essex",
              "company_type_group": "Limited Company (LTD)",
              "last_accounts_date": "2023-05-31",
              "company_number": "08523952",
              "name": "44SOUTH LIMITED",
              "is_company": 1,
              "isRoot": 1
            }
          },
          "fill": "red",
          "className": "Company",
          "style": {
            "label": "44SOUTH LIMITED"
          }
        }
      },
      {
        "id": "158016919",
        "label": "Mr James Barclay Trigg",
        "fill": "#1dc564",
        "activeFill": "#347851",
        "icon": "/assets/zoomcharts/icons/Officer.png",
        "data": {
          "id": "158016919",
          "loaded": true,
          "extra": {
            "id": "158016919",
            "elementId": "4:9143ec59-4bd2-40a1-b4c2-3921e2aa8d4f:158016919",
            "labels": [
              "Person"
            ],
            "properties": {
              "date_neo4j_sync": "2024-07-24T07:56:26.136123713Z",
              "birth_month": 3,
              "date_of_birth": "1977-03-01",
              "last_name": "Trigg",
              "title": "Mr",
              "middle_name": "Barclay",
              "birth_year": 1977,
              "gender_name": "Male",
              "total_entity_count": 6,
              "current": 1,
              "nationality": "British",
              "is_bobble": 0,
              "name": "Mr James Barclay Trigg",
              "honours": "",
              "id": 17992378,
              "first_name_initial": "J",
              "is_company": 0,
              "first_name": "James",
              "date_last_updated": "2024-07-18T19:54:35.063Z",
              "isRoot": 0
            }
          },
          "className": "Person",
          "fill": "#1dc564",
          "style": {
            "label": "Mr James Barclay Trigg"
          }
        }
      },
      {
        "id": "32589261",
        "label": "TOWER DERIVATIVES TRAINING LIMITED",
        "fill": "#7456DB",
        "activeFill": "#2E233B",
        "icon": "/assets/zoomcharts/icons/Company.png",
        "data": {
          "id": "32589261",
          "loaded": true,
          "extra": {
            "id": "32589261",
            "elementId": "4:9143ec59-4bd2-40a1-b4c2-3921e2aa8d4f:32589261",
            "labels": [
              "Company"
            ],
            "properties": {
              "company_type": "ltd",
              "date_neo4j_sync": "2024-07-19T07:20:30.859505895Z",
              "company_status_display": "Dissolved",
              "id_postcode_mapping": 2338535,
              "address_string": "New Bridge Street House, 30-34 New Bridge Street, London, EC4V 6BJ",
              "address_posttown": "London",
              "latitude": 51.512657165527344,
              "coordinates": {
                "type": "Point",
                "coordinates": [
                  -0.10403499752283096,
                  51.512657165527344
                ],
                "crs": {
                  "srid": 4326,
                  "name": "wgs-84",
                  "type": "link",
                  "properties": {
                    "href": "https://spatialreference.org/ref/epsg/4326/ogcwkt/",
                    "type": "ogcwkt"
                  }
                }
              },
              "company_status_group": "Closed",
              "address_postcode": "EC4V 6BJ",
              "date_incorporated": "2009-02-20",
              "company_type_display": "Private limited company",
              "date_dissolved": "2018-09-04",
              "company_type_group": "Limited Company (LTD)",
              "last_accounts_date": "2016-06-30",
              "company_number": "06825967",
              "address_line2": "30-34 New Bridge Street",
              "address_line1": "New Bridge Street House",
              "name": "TOWER DERIVATIVES TRAINING LIMITED",
              "company_status": "dissolved",
              "id": 3112354,
              "is_company": 1,
              "longitude": -0.10403499752283096,
              "date_last_updated": "2024-02-22T07:46:54.267Z",
              "isRoot": 0
            }
          },
          "className": "Company",
          "style": {
            "label": "TOWER DERIVATIVES TRAINING LIMITED"
          }
        }
      },
      {
        "id": "752901",
        "label": "Mr Richard James Midgley",
        "fill": "#1dc564",
        "activeFill": "#347851",
        "icon": "/assets/zoomcharts/icons/Officer.png",
        "data": {
          "id": "752901",
          "loaded": true,
          "extra": {
            "id": "752901",
            "elementId": "4:9143ec59-4bd2-40a1-b4c2-3921e2aa8d4f:752901",
            "labels": [
              "Person"
            ],
            "properties": {
              "date_neo4j_sync": "2024-07-24T08:08:57.343178941Z",
              "date_of_birth": "1943-09-01",
              "birth_month": 9,
              "last_name": "Midgley",
              "title": "Mr",
              "middle_name": "James",
              "gender_name": "Male",
              "birth_year": 1943,
              "total_entity_count": 8,
              "current": 1,
              "nationality": "British",
              "is_bobble": 0,
              "name": "Mr Richard James Midgley",
              "honours": "",
              "id": 221264,
              "first_name_initial": "R",
              "is_company": 0,
              "first_name": "Richard",
              "date_last_updated": "2024-07-18T19:54:39.367Z",
              "isRoot": 0
            }
          },
          "className": "Person",
          "fill": "#1dc564",
          "style": {
            "label": "Mr Richard James Midgley"
          }
        }
      }
    ],
    "edges": [
      {
        "id": "289340891",
        "source": "752901",
        "target": "32589261",
        "label": "",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "251059907",
        "source": "752901",
        "target": "4874442",
        "label": "",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "251059906",
        "source": "157918165",
        "target": "4874442",
        "label": "",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "245286136",
        "source": "158016919",
        "target": "487883",
        "label": "",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "254238671",
        "source": "158016919",
        "target": "7320792",
        "label": "",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "254238670",
        "source": "157918667",
        "target": "7320792",
        "label": "",
        "backgroundColor": "#00A2A1"
      },
      {
        "id": "289340881",
        "source": "157918667",
        "target": "32589261",
        "label": "",
        "backgroundColor": "#00A2A1"
      }
    ]
  }
  const ref = useRef<GraphCanvasRef | null>(null);
  const { selections, actives, onNodeClick, onCanvasClick, onNodePointerOver, onNodePointerOut } = useSelection({
    ref: ref,
    nodes: testData.nodes,
    edges: testData.edges,
    pathHoverType: "direct",
    pathSelectionType: "direct",
    // type:"multi",
// hotkeys:["selectAll"]
// focusOnSelect:true
// disabled:true
});


  return <GraphCanvas
    theme={theme}
    ref={ref}
    selections={selections}
    actives={actives}
    onNodePointerOver={onNodePointerOver}
    onNodePointerOut={onNodePointerOut}
    onNodeClick={onNodeClick}
    onCanvasClick={onCanvasClick}
    layoutType="forceDirected2d"
    draggable
    cameraMode="pan"
    edgeLabelPosition="natural"
    edgeInterpolation='linear'    
    labelType="all"
    nodes={testData.nodes}
    edges={testData.edges}
    defaultNodeSize={1}
    edgeArrowPosition="none"
    renderNode={({ node, ...rest }) => (
      <SphereWithIcon {...rest} node={node} image={node.icon || ""} />
    )}
    layoutOverrides={{
      // nodeLevelRatio: 2.5,
      linkDistance: 50,
      // nodeStrength: -3000,
      // clusterStrength: 1,
      // forceLinkStrength: 1,
      // forceLinkDistance: 300,
      // nodeSeparation: 100,

    }}
  />
}