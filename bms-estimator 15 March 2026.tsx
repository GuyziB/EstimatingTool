import { useState, useRef, useMemo } from "react";

const CODES = {
  410:"Controllers",411:"Controller Modules",412:"Signal Cable",413:"Modbus Cable",
  414:"CAT Cable",415:"Control Panels",416:"Field Devices",417:"DALI-KNX",
  418:"Fire Equipment",419:"Data Networks",420:"Panel Building",421:"Termination/Testing/FAT",
  501:"Erection Materials",505:"Busbar Trunking",510:"Switchgear",511:"MCC Equipment",
  512:"BMS Equipment",520:"PVC Pipes/Ducts",570:"Control Panels (Main)",
  615:"Elec Single Core Cables",616:"Elec Multicore Cables",617:"ELV/BMS/Special Cables",
  620:"Cable Accessories",650:"Galv Cable Trays",651:"PVC Cable Trays",
  652:"Galv Cable Basket",654:"Galv Cable Ladder",675:"Galv Cable Trunking",
  676:"Alum Cable Trunking",680:"PVC Cable Trunking",681:"Underfloor Cable Trunking",
  690:"Galv Conduit",700:"PVC Conduit",705:"Wiring Accessories",
  725:"Fire Alarm Equipment",750:"Security Alarm",751:"Access Control",
  753:"Sub-Contracting Install Elec",820:"UPS/Voltage Stabilisers",
  821:"Data Network Equipment",835:"Light Fittings",845:"Generators/AMF",
  870:"Tools & Instruments",875:"Consumables",880:"Drawings/Manuals",
  885:"Spare Parts",900:"Labour",901:"Dismantling",902:"Testing & Commissioning",
  960:"Sub-Contracting Works",961:"Enemalta Application",962:"Cranage & Transport",970:"Provisional Sum"
};

const FIELD_DEVICES = [
  {id:"fd_bv125",desc:"Butterfly Valve 2-way DN125 + BACnet Actuator 90Nm IP66",partNo:"D6125W/JRCA-BAC-S2-T",rate:915.00},
  {id:"fd_bv100",desc:"Butterfly Valve 2-way DN100 + BACnet Actuator 90Nm IP66",partNo:"D6100W/JRCA-BAC-S2-T",rate:854.00},
  {id:"fd_bv80",desc:"Butterfly Valve 2-way DN80 + Actuator 40Nm IP54",partNo:"D680N/GR24A-SR-5",rate:429.50},
  {id:"fd_bv65",desc:"Butterfly Valve 2-way DN65 + Actuator 20Nm IP54",partNo:"D665N/SR24A-SR-5",rate:329.50},
  {id:"fd_bv50",desc:"Butterfly Valve 2-way DN50 + Actuator 20Nm IP54",partNo:"D665N/SR24A-SR-5",rate:314.50},
  {id:"fd_ts100",desc:"Duct/Immersion Temp Sensor NTC10k 100mm + Thermowell SS G1/2\"",partNo:"01DT-1LL / A-22P-A08",rate:41.50},
  {id:"fd_ts_cable",desc:"Cable Temp Sensor NTC10k 200mm 2m cable",partNo:"01CT-1LPF",rate:14.70},
  {id:"fd_act40",desc:"Rotary Actuator 40Nm 24V MFT 2-10V IP54",partNo:"GM24A-MF",rate:264.00},
  {id:"fd_avt",desc:"Air Velocity Transmitter 0-10V + Multi-point Probe 100mm",partNo:"TPAVT8/10 and TPVPMP/200",rate:124.74},
  {id:"fd_dps",desc:"Differential Pressure Switch 20-300Pa",partNo:"01APS-10R",rate:19.35},
];

const CATS = ["DDC Controllers","Control Panels","Integrated Systems","Field Equipment","Labour","Misc Blocks","Common Field Devices"];

const INITIAL_BLOCKS = [
  {id:"b_labour",name:"Labour Rates",category:"Labour",description:"Standard BMS labour rates",lines:[
    {id:"l1",desc:"AGV Pair",partNo:"",code:900,unit:"hr",rate:24.288,labour:0,qty:1,markup:1,workPkg:""},
    {id:"l2",desc:"BMS Pair",partNo:"",code:900,unit:"hr",rate:33.644,labour:0,qty:1,markup:1,workPkg:""},
    {id:"l3",desc:"BMS Tech — Single Rate",partNo:"",code:900,unit:"hr",rate:21.5,labour:0,qty:1,markup:1,workPkg:""},
    {id:"l4",desc:"BMS Engineer — Single Rate",partNo:"",code:900,unit:"hr",rate:32,labour:0,qty:1,markup:1,workPkg:""},
  ]},
  {id:"b_ddc_small",name:"DDC Small (ECY-203)",category:"DDC Controllers",description:"Distech ECY-203 controller with LL signal cable",lines:[
    {id:"s1",desc:"ECY-203-C1 — 8UI 8UO 3Modbus BACnet/IP",partNo:"ECY-203-C1",code:410,unit:"No",rate:375.63,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"s2",desc:"24V 30A Power Supply",partNo:"PW-HDR-30-24",code:411,unit:"No",rate:21.66,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"s3",desc:"Control Panel — DDC Panel",partNo:"",code:415,unit:"No",rate:100,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"s4",desc:"Panel Building",partNo:"",code:420,unit:"No",rate:400,labour:4,qty:1,markup:1,workPkg:"3"},
    {id:"s5",desc:"Containment — Roof",partNo:"",code:412,unit:"m",rate:4.68,labour:0.25,qty:60,markup:1,workPkg:"3"},
    {id:"s6",desc:"3 Core Signal Cable — Roof",partNo:"",code:412,unit:"m",rate:0.82,labour:0.11,qty:120,markup:1,workPkg:"3"},
  ]},
  {id:"b_ddc_medium",name:"DDC Medium (ECY-600)",category:"DDC Controllers",description:"Distech ECY-600 with LL signal and Modbus",lines:[
    {id:"m1",desc:"Distech ECY-600",partNo:"ECY-600-C1",code:410,unit:"No",rate:984.96,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"m2",desc:"Power Supply Module 100-240VAC",partNo:"CDIY-PS24-00",code:416,unit:"No",rate:44.18,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"m3",desc:"Controller Module — 8UI6DOT",partNo:"8UI6DOT",code:411,unit:"No",rate:300.96,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"m4",desc:"Controller Module — 8UI",partNo:"8UI",code:411,unit:"No",rate:206.34,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"m5",desc:"Controller Module — ECY-RS485 Gen2",partNo:"ECY-RS485 Gen2",code:411,unit:"No",rate:466.26,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"m6",desc:"Control Panel — DDC Panel",partNo:"",code:415,unit:"No",rate:250,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"m7",desc:"Panel Building",partNo:"",code:420,unit:"No",rate:500,labour:4,qty:1,markup:1,workPkg:"3"},
    {id:"m8",desc:"Containment — Signal Cable LL",partNo:"",code:412,unit:"m",rate:4.68,labour:0.25,qty:100,markup:1,workPkg:"3"},
    {id:"m9",desc:"Signal Cable — LL Various",partNo:"",code:412,unit:"m",rate:0.82,labour:0.11,qty:350,markup:1,workPkg:"3"},
    {id:"m10",desc:"Containment — RS485/Modbus",partNo:"",code:413,unit:"m",rate:4.68,labour:0.25,qty:100,markup:1,workPkg:"3"},
    {id:"m11",desc:"RS485 Cable — BACnet/Modbus",partNo:"",code:413,unit:"m",rate:0.82,labour:0.11,qty:250,markup:1,workPkg:"3"},
    {id:"m12",desc:"CAT Cable",partNo:"",code:414,unit:"m",rate:2.5,labour:0.15,qty:50,markup:1,workPkg:"3"},
  ]},
  {id:"b_ddc_large",name:"DDC Large / Apex (ECY-APEX)",category:"DDC Controllers",description:"Distech ECY-APEX with LL signal and Modbus",lines:[
    {id:"a1",desc:"Eclypse APEX",partNo:"ECY-APEX-48-C5-20",code:410,unit:"No",rate:0,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"a2",desc:"Power Supply Module 100-240VAC",partNo:"CDIY-PS24-00",code:416,unit:"No",rate:44.18,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"a3",desc:"Controller Module — ECY-RS485 Gen2",partNo:"ECY-RS485 Gen2",code:411,unit:"No",rate:466.26,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"a4",desc:"Controller Module — ECY-8UI6UO",partNo:"ECY-8UI6UO",code:411,unit:"No",rate:312.93,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"a5",desc:"Controller Module — ECY-4UI4UO",partNo:"ECY-4UI4UO",code:411,unit:"No",rate:219.45,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"a6",desc:"Control Panel — DDC Panel",partNo:"",code:415,unit:"No",rate:150,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"a7",desc:"Panel Building",partNo:"",code:420,unit:"No",rate:500,labour:4,qty:1,markup:1,workPkg:"3"},
    {id:"a8",desc:"Containment — Signal Cable LL",partNo:"",code:412,unit:"m",rate:4.68,labour:0.25,qty:50,markup:1,workPkg:"3"},
    {id:"a9",desc:"Signal Cable — LL",partNo:"",code:412,unit:"m",rate:0.82,labour:0.11,qty:125,markup:1,workPkg:"3"},
    {id:"a10",desc:"Containment — RS485/Modbus",partNo:"",code:413,unit:"m",rate:4.68,labour:0.25,qty:10,markup:1,workPkg:"3"},
    {id:"a11",desc:"RS485 Cable — BACnet/Modbus",partNo:"",code:413,unit:"m",rate:0.82,labour:0.11,qty:110,markup:1,workPkg:"3"},
  ]},
  {id:"b_ddc_display",name:"DDC Panel with Display (ECY-S1000)",category:"DDC Controllers",description:"ECY-S1000 with display, modules, UPS and panel — adjust module count and controller per job",lines:[
    {id:"dd1",desc:"UPS for DDC Panel",partNo:"",code:820,unit:"No",rate:500,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"dd2",desc:"ECY-Display-10",partNo:"",code:410,unit:"No",rate:1175.97,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"dd3",desc:"ECY-MBUS Gen2",partNo:"",code:411,unit:"No",rate:241.88,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"dd4",desc:"ECY-RS485 Gen2",partNo:"",code:411,unit:"No",rate:268.10,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"dd5",desc:"ECY-16DI 16-point Digital Input Module",partNo:"",code:411,unit:"No",rate:224.84,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"dd6",desc:"ECY-8UI Input Module",partNo:"",code:411,unit:"No",rate:237.29,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"dd7",desc:"ECY-8UI6UO I/O Module",partNo:"",code:411,unit:"No",rate:359.87,labour:0,qty:3,markup:1,workPkg:"3"},
    {id:"dd8",desc:"ECY-PS24 Power Supply Module",partNo:"",code:411,unit:"No",rate:50.81,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"dd9",desc:"ECY-S1000-48-C10 Connected System Controller",partNo:"ECY-S1000-48-C10",code:410,unit:"No",rate:637.80,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"dd10",desc:"Relay",partNo:"",code:415,unit:"No",rate:5,labour:0,qty:6,markup:1,workPkg:"3"},
    {id:"dd11",desc:"Panel Building",partNo:"",code:420,unit:"No",rate:750,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"dd12",desc:"Control Panel Enclosure",partNo:"",code:415,unit:"No",rate:400,labour:0,qty:1,markup:1,workPkg:"3"},
  ]},
  {id:"b_ef_dol",name:"Basic EF Control Panel — DoL",category:"Control Panels",description:"Direct-on-line starter panel (Schrack)",lines:[
    {id:"ef1",desc:"Wall-mounted Enclosure IP66 500x400x300mm",partNo:"WSA5040300",code:415,unit:"No",rate:80.91,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ef2",desc:"Wall-mounting Brackets",partNo:"WSAWB004",code:415,unit:"No",rate:3.43,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ef3",desc:"Knitted Earthing Cable 260mm",partNo:"WSTCUF260",code:415,unit:"No",rate:2.55,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ef4",desc:"Selector Switch 3-pos Stay-put",partNo:"MM216872",code:415,unit:"No",rate:8,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ef5",desc:"Motor Protection Circuit Breaker BE2 6-10A",partNo:"BE201000",code:415,unit:"No",rate:9.55,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ef6",desc:"Screw Earth Terminal AVK 6/10T",partNo:"IK622010",code:415,unit:"No",rate:1.25,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"ef7",desc:"Auxiliary Contact Front BE2",partNo:"BE2ZAF11",code:415,unit:"No",rate:0.094,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"ef8",desc:"CAPUS Switch-disconnector 3-pole 25A",partNo:"SI338120",code:415,unit:"No",rate:16.91,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ef9",desc:"CAPUS Connection Space Cover",partNo:"SI336940",code:415,unit:"No",rate:5.57,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ef10",desc:"CAPUS Extension Shaft 300mm",partNo:"SI336820",code:415,unit:"No",rate:5.7,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ef11",desc:"CAPUS Rotary Handle",partNo:"SI336650",code:415,unit:"No",rate:7.4,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ef12",desc:"LED Indicator Red 230VAC",partNo:"BZ501215-B",code:415,unit:"No",rate:0.98,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ef13",desc:"LED Indicator Green 230VAC",partNo:"BZ501218-B",code:415,unit:"No",rate:0.98,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ef14",desc:"LED Indicator White 230VAC",partNo:"BZ501219-B",code:415,unit:"No",rate:0.98,labour:0,qty:3,markup:1,workPkg:"3"},
    {id:"ef15",desc:"MCB AMPARO 10kA B2A 1-pole",partNo:"AM018102",code:415,unit:"No",rate:2.42,labour:0,qty:5,markup:1,workPkg:"3"},
    {id:"ef16",desc:"Control Transformer 230V/24V 100VA",partNo:"LP602010T",code:415,unit:"No",rate:30,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ef17",desc:"Contactor 3-pole CUBICO 5.5kW 12A 24VAC",partNo:"LZDC12B0",code:415,unit:"No",rate:7,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ef18",desc:"Consumables",partNo:"Misc",code:875,unit:"No",rate:50,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ef19",desc:"Panel Building",partNo:"Catania",code:420,unit:"No",rate:250,labour:2,qty:1,markup:1,workPkg:"3"},
  ]},
  {id:"b_ef_inv",name:"Basic EF Control Panel — With Inverter",category:"Control Panels",description:"As DoL but with Fuji Electric VFD (TBC)",lines:[
    {id:"fi1",desc:"Wall-mounted Enclosure IP66 500x400x300mm",partNo:"WSA5040300",code:415,unit:"No",rate:80.91,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fi2",desc:"Wall-mounting Brackets",partNo:"WSAWB004",code:415,unit:"No",rate:3.43,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fi3",desc:"Knitted Earthing Cable 260mm",partNo:"WSTCUF260",code:415,unit:"No",rate:2.55,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fi4",desc:"Selector Switch 3-pos Stay-put",partNo:"MM216872",code:415,unit:"No",rate:8,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fi5",desc:"Motor Protection Circuit Breaker BE2 6-10A",partNo:"BE201000",code:415,unit:"No",rate:9.55,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fi6",desc:"Screw Earth Terminal AVK 6/10T",partNo:"IK622010",code:415,unit:"No",rate:1.25,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"fi7",desc:"Auxiliary Contact Front BE2",partNo:"BE2ZAF11",code:415,unit:"No",rate:0.094,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"fi8",desc:"CAPUS Switch-disconnector 3-pole 25A",partNo:"SI338120",code:415,unit:"No",rate:16.91,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fi9",desc:"CAPUS Connection Space Cover",partNo:"SI336940",code:415,unit:"No",rate:5.57,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fi10",desc:"CAPUS Extension Shaft 300mm",partNo:"SI336820",code:415,unit:"No",rate:5.7,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fi11",desc:"CAPUS Rotary Handle",partNo:"SI336650",code:415,unit:"No",rate:7.4,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fi12",desc:"LED Indicator Red 230VAC",partNo:"BZ501215-B",code:415,unit:"No",rate:0.98,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fi13",desc:"LED Indicator Green 230VAC",partNo:"BZ501218-B",code:415,unit:"No",rate:0.98,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fi14",desc:"LED Indicator White 230VAC",partNo:"BZ501219-B",code:415,unit:"No",rate:0.98,labour:0,qty:3,markup:1,workPkg:"3"},
    {id:"fi15",desc:"MCB AMPARO 10kA B2A 1-pole",partNo:"AM018102",code:415,unit:"No",rate:2.42,labour:0,qty:5,markup:1,workPkg:"3"},
    {id:"fi16",desc:"Control Transformer 230V/24V 100VA",partNo:"LP602010T",code:415,unit:"No",rate:30,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fi17",desc:"Fuji Electric VFD — TBC",partNo:"TBC",code:415,unit:"No",rate:0,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fi18",desc:"Consumables",partNo:"Misc",code:875,unit:"No",rate:50,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fi19",desc:"Panel Building",partNo:"Catania",code:420,unit:"No",rate:250,labour:2,qty:1,markup:1,workPkg:"3"},
  ]},
  {id:"b_vcp",name:"VCP — Ventilation Control Panel",category:"Control Panels",description:"Smoke extraction control, FAP interface, manual actuation",lines:[
    {id:"v1",desc:"Wall-mounted Enclosure IP66 500x400x300mm",partNo:"WSA5040300",code:415,unit:"No",rate:80.91,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"v2",desc:"Wall-mounting Brackets",partNo:"WSAWB004",code:415,unit:"No",rate:3.43,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"v3",desc:"Knitted Earthing Cable 260mm",partNo:"WSTCUF260",code:415,unit:"No",rate:2.55,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"v4",desc:"Selector Switch 3-pos Stay-put",partNo:"MM216872",code:415,unit:"No",rate:8,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"v5",desc:"Motor Protection Circuit Breaker BE2 6-10A",partNo:"BE201000",code:415,unit:"No",rate:9.55,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"v6",desc:"Screw Earth Terminal AVK 6/10T",partNo:"IK622010",code:415,unit:"No",rate:1.25,labour:0,qty:4,markup:1,workPkg:"3"},
    {id:"v7",desc:"Auxiliary Contact Front BE2",partNo:"BE2ZAF11",code:415,unit:"No",rate:0.09,labour:0,qty:4,markup:1,workPkg:"3"},
    {id:"v8",desc:"CAPUS Switch-disconnector 3-pole 25A",partNo:"SI338120",code:415,unit:"No",rate:16.91,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"v9",desc:"CAPUS Connection Space Cover",partNo:"SI336940",code:415,unit:"No",rate:5.57,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"v10",desc:"CAPUS Extension Shaft 300mm",partNo:"SI336820",code:415,unit:"No",rate:5.7,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"v11",desc:"CAPUS Rotary Handle",partNo:"SI336650",code:415,unit:"No",rate:7.4,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"v12",desc:"LED Indicator Red 230VAC",partNo:"BZ501215-B",code:415,unit:"No",rate:0.98,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"v13",desc:"LED Indicator Green 230VAC",partNo:"BZ501218-B",code:415,unit:"No",rate:0.98,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"v14",desc:"LED Indicator White 230VAC",partNo:"BZ501219-B",code:415,unit:"No",rate:0.98,labour:0,qty:6,markup:1,workPkg:"3"},
    {id:"v15",desc:"MCB AMPARO 10kA B2A 1-pole",partNo:"AM018102",code:415,unit:"No",rate:2.42,labour:0,qty:10,markup:1,workPkg:"3"},
    {id:"v16",desc:"Control Transformer 230V/24V 100VA",partNo:"LP602010T",code:415,unit:"No",rate:30,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"v17",desc:"Fuji HVAC AR1 3ph 400V",partNo:"FRN15AR1L-4E",code:415,unit:"No",rate:897,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"v18",desc:"Consumables",partNo:"Misc",code:875,unit:"No",rate:50,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"v19",desc:"Panel Building",partNo:"Catania",code:420,unit:"No",rate:400,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"v20",desc:"Installation and Functional Testing — AGV",partNo:"",code:902,unit:"hr",rate:24.288,labour:0,qty:8,markup:1,workPkg:"3"},
    {id:"v21",desc:"Installation and Functional Testing — BMS Engineer",partNo:"",code:902,unit:"hr",rate:32,labour:0,qty:4,markup:1,workPkg:"3"},
  ]},
  {id:"b_fdcp",name:"Fire Damper Control Panel (FDCP) with Interfaces",category:"Control Panels",description:"ECY-S1000 + HORYZON display + Modbus I/O interfaces + Schrack panel",lines:[
    {id:"fd1",desc:"24VAC/VDC Power Supply Module",partNo:"ECY-PS24",code:411,unit:"No",rate:40.47,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fd2",desc:"ECY-S1000-48-C10 Connected System Controller",partNo:"ECY-S1000-48-C10",code:410,unit:"No",rate:529.53,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fd3",desc:"ECLYPSE Connectivity Pack C5",partNo:"ECLYPSE C5",code:411,unit:"No",rate:119.70,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fd4",desc:"ECY-4UI4UO-HOA 8-point I/O Module with HOA",partNo:"ECY-4UI4UO-HOA",code:411,unit:"No",rate:241.68,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fd5",desc:"HORYZON-C10 Gen2 10\" Touchscreen Display",partNo:"HORYZON-C10 Gen2",code:410,unit:"No",rate:864.12,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fd6",desc:"Modbus I/O Module 4DI+2RO IP65 230V",partNo:"MR-DIO4/2-IP65-Modbus_RTU-230V",code:416,unit:"No",rate:180.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fd7",desc:"Single-phase PSU 230VAC/24VDC 4.5A",partNo:"LP412405",code:415,unit:"No",rate:44.53,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fd8",desc:"MCB 2-pole 10A — PSU Primary",partNo:"",code:415,unit:"No",rate:5.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fd9",desc:"MCB 4A — PSU Secondary",partNo:"",code:415,unit:"No",rate:5.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fd10",desc:"LED Indicator White 230VAC",partNo:"BZ501219-B",code:415,unit:"No",rate:0.98,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fd11",desc:"MCB 1A — Power ON Lamp",partNo:"",code:415,unit:"No",rate:5.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fd12",desc:"PCB Relay 2CO 12VDC 8A",partNo:"RT424012",code:415,unit:"No",rate:0.97,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"fd13",desc:"Socket Screw Terminals for PCB Relay",partNo:"RT78725",code:415,unit:"No",rate:1.80,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"fd14",desc:"Retaining Clip for RT Relay",partNo:"RT17017",code:415,unit:"No",rate:0.15,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"fd15",desc:"Marking Tag for YRT Socket",partNo:"YRT16040",code:415,unit:"No",rate:0.04,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"fd16",desc:"LED Module Red 6-24VAC/DC",partNo:"YMLRA024",code:415,unit:"No",rate:0.77,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"fd17",desc:"LED Module Green 6-24VAC/DC",partNo:"YMLGA024",code:415,unit:"No",rate:0.89,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"fd18",desc:"Wall-mounted Enclosure IP66 600x600x210mm",partNo:"WSA6060210",code:415,unit:"No",rate:109.18,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fd19",desc:"Panel Building",partNo:"",code:420,unit:"No",rate:400.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fd20",desc:"Metz BACnet I/O Module 4DI+2RO IP65 230V",partNo:"XX-DIO4/2-IP65-Modbus_RTU-230V",code:416,unit:"No",rate:168.20,labour:0,qty:0,markup:1,workPkg:"3"},
    {id:"fd21",desc:"Metz BACnet I/O Module 2DI+1RO IP65 230V",partNo:"MB-DIO2/1-IP Modbus/BACnet 230V",code:416,unit:"No",rate:126.00,labour:0,qty:0,markup:1,workPkg:"3"},
  ]},
  {id:"b_water_level_panel",name:"Water Level Indication and Alarm Panel",category:"Control Panels",description:"ECY-300 controller + float switches + Schrack panel",lines:[
    {id:"wl1",desc:"Float Switch",partNo:"",code:416,unit:"No",rate:25.00,labour:0,qty:9,markup:1,workPkg:"3"},
    {id:"wl2",desc:"ECY-300-C1 Connected Equipment Controller",partNo:"ECY-300-C1",code:410,unit:"No",rate:522.69,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"wl3",desc:"Single-phase PSU 230VAC/24VDC 4.5A",partNo:"LP412405",code:415,unit:"No",rate:44.53,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"wl4",desc:"MCB 2-pole 10A — PSU Primary",partNo:"",code:415,unit:"No",rate:5.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"wl5",desc:"MCB 4A — PSU Secondary",partNo:"",code:415,unit:"No",rate:5.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"wl6",desc:"LED Indicator White 230VAC",partNo:"BZ501219-B",code:415,unit:"No",rate:0.98,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"wl7",desc:"MCB 1A — Power ON Lamp",partNo:"",code:415,unit:"No",rate:5.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"wl8",desc:"PCB Relay 2CO 12VDC 8A",partNo:"RT424012",code:415,unit:"No",rate:0.97,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"wl9",desc:"Socket Screw Terminals for PCB Relay",partNo:"RT78725",code:415,unit:"No",rate:1.80,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"wl10",desc:"Retaining Clip for RT Relay",partNo:"RT17017",code:415,unit:"No",rate:0.15,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"wl11",desc:"Marking Tag for YRT Socket",partNo:"YRT16040",code:415,unit:"No",rate:0.04,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"wl12",desc:"LED Module Red 6-24VAC/DC",partNo:"YMLRA024",code:415,unit:"No",rate:0.77,labour:0,qty:9,markup:1,workPkg:"3"},
    {id:"wl13",desc:"LED Module Green 6-24VAC/DC",partNo:"YMLGA024",code:415,unit:"No",rate:0.89,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"wl14",desc:"Wall-mounted Enclosure IP66 600x600x210mm",partNo:"WSA6060210",code:415,unit:"No",rate:109.18,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"wl15",desc:"Sounder BU2",partNo:"BU2",code:415,unit:"No",rate:6.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"wl16",desc:"Mute Button",partNo:"",code:415,unit:"No",rate:6.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"wl17",desc:"Panel Building",partNo:"",code:420,unit:"No",rate:300.00,labour:0,qty:1,markup:1,workPkg:"3"},
  ]},
  {id:"b_ahu_full",name:"AHU — Full Control Panel + Control Valves (Existing AHU)",category:"Control Panels",description:"ECY-S1000 + modules + field devices + full Schrack panel — adjust valve sizes and module count per AHU duty",lines:[
    {id:"af1",desc:"24VAC/VDC Power Supply Module",partNo:"ECY-PS24",code:411,unit:"No",rate:41.90,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"af2",desc:"ECY-S1000-48-C1 Connected System Controller",partNo:"ECY-S1000-48-C1",code:410,unit:"No",rate:357.39,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af3",desc:"16-point Digital Input Module",partNo:"ECY-16DI",code:411,unit:"No",rate:185.25,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af4",desc:"14-point I/O Module with HOA",partNo:"ECY-8UI6UO-HOA",code:411,unit:"No",rate:352.83,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af5",desc:"8-point I/O Module with HOA",partNo:"ECY-4UI4UO-HOA",code:411,unit:"No",rate:250.23,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af6",desc:"6-point UO Module with HOA",partNo:"ECY-6UO-HOA",code:411,unit:"No",rate:230.85,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af7",desc:"ECLYPSE WiFi Adapter",partNo:"ECLYPSE WiFi Adapter",code:411,unit:"No",rate:50.84,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af8",desc:"ECLYPSE 6ft HD15 Cable",partNo:"ECLYPSE 6' HD15 cable",code:411,unit:"No",rate:23.66,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af9",desc:"Damper Actuator Non-Spring Return 15Nm 24VAC",partNo:"DA-227C-024-15",code:416,unit:"No",rate:122.27,labour:0,qty:3,markup:1,workPkg:"3"},
    {id:"af10",desc:"Air DP & Volume Flow Transducer 0-2500Pa",partNo:"PS-DPA2500 VV",code:416,unit:"No",rate:90.35,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"af11",desc:"Duct Humidity & Temp Transducer 140mm",partNo:"HS-D TH 140 VV",code:416,unit:"No",rate:103.17,labour:0,qty:3,markup:1,workPkg:"3"},
    {id:"af12",desc:"Duct CO2 & Temp Transducer",partNo:"GS-D TCO2 VV",code:416,unit:"No",rate:190.95,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af13",desc:"Duct/Immersion Temp Transducer 300mm 0-10V",partNo:"TS-DI 300 V",code:416,unit:"No",rate:64.98,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af14",desc:"3-Way Valve & Actuator DN32",partNo:"R3032-16-S3/NR24A-SR",code:416,unit:"No",rate:321.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af15",desc:"3-Way Valve & Actuator DN50",partNo:"R3050-58-S4/SR24A-SR",code:416,unit:"No",rate:547.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af16",desc:"Wall-mounted Enclosure IP65 1200x800x300mm",partNo:"WSA1208300",code:415,unit:"No",rate:350.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af17",desc:"Voltage Monitoring Relay 3-phase",partNo:"UR5U3011",code:415,unit:"No",rate:26.68,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af18",desc:"Phase Monitoring Relay",partNo:"UR5P3011",code:415,unit:"No",rate:32.22,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af19",desc:"LED Indicator White 230VAC",partNo:"BZ501219-B",code:415,unit:"No",rate:0.98,labour:0,qty:3,markup:1,workPkg:"3"},
    {id:"af20",desc:"LED Indicator Red 24VAC",partNo:"BZ501210-B",code:415,unit:"No",rate:0.98,labour:0,qty:4,markup:1,workPkg:"3"},
    {id:"af21",desc:"Push-button Flat Spring-return Black",partNo:"MM216590",code:415,unit:"No",rate:1.82,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af22",desc:"Emergency Stop Button Non-illum Red",partNo:"MM263467",code:415,unit:"No",rate:7.62,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af23",desc:"Ventilation Thermostat 0-60°C",partNo:"IUK08566",code:415,unit:"No",rate:6.70,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af24",desc:"Control Transformer 230V/24V 100VA",partNo:"LP612010T",code:415,unit:"No",rate:27.29,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af25",desc:"Emergency Stop Label 60mm",partNo:"MM216483",code:415,unit:"No",rate:2.22,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af26",desc:"Buzzer Continuous Tone 18-30VDC",partNo:"MM229025",code:415,unit:"No",rate:7.04,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af27",desc:"Acoustic Indicator Empty Black",partNo:"MM229015",code:415,unit:"No",rate:3.96,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af28",desc:"Fuse Carrier 3-pole 32A 10x38",partNo:"IS506103",code:415,unit:"No",rate:3.96,labour:0,qty:6,markup:1,workPkg:"3"},
    {id:"af29",desc:"Fuse Carrier 1-pole 32A 10x38",partNo:"IS506101",code:415,unit:"No",rate:1.10,labour:0,qty:6,markup:1,workPkg:"3"},
    {id:"af30",desc:"Cylindrical Fuse 10x38 1A gG 500VAC",partNo:"ISZ10001",code:415,unit:"No",rate:0.37,labour:0,qty:6,markup:1,workPkg:"3"},
    {id:"af31",desc:"Cylindrical Fuse 10x38 4A gG 500VAC",partNo:"ISZ10004",code:415,unit:"No",rate:0.37,labour:0,qty:6,markup:1,workPkg:"3"},
    {id:"af32",desc:"MCB DC-C2/1 10kA",partNo:"BM015102",code:415,unit:"No",rate:27.41,labour:0,qty:3,markup:1,workPkg:"3"},
    {id:"af33",desc:"MPCB 3-pole 6.3-10A",partNo:"BE510000",code:415,unit:"No",rate:18.75,labour:0,qty:3,markup:1,workPkg:"3"},
    {id:"af34",desc:"Auxiliary Contact Side 1NO+1NC",partNo:"BE072896",code:415,unit:"No",rate:2.92,labour:0,qty:3,markup:1,workPkg:"3"},
    {id:"af35",desc:"Modular Contactor 25A 1NO+3NC 24VACDC",partNo:"BZ326464VM",code:415,unit:"No",rate:20.78,labour:0,qty:3,markup:1,workPkg:"3"},
    {id:"af36",desc:"CAPUS Switch-disconnector 3-pole+N 80A",partNo:"SI338890",code:415,unit:"No",rate:49.46,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af37",desc:"CAPUS Rotary Handle yellow-red",partNo:"SI336660",code:415,unit:"No",rate:7.40,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af38",desc:"CAPUS Extension Shaft 300mm",partNo:"SI336820",code:415,unit:"No",rate:5.70,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af39",desc:"CAPUS Connection Space Cover (set)",partNo:"SI336950",code:415,unit:"No",rate:6.27,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af40",desc:"CAPUS Connection Space Cover (set)",partNo:"SI336980",code:415,unit:"No",rate:5.29,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af41",desc:"Adapter Front",partNo:"MM216374",code:415,unit:"No",rate:0.58,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"af42",desc:"NC Contact Block Front Mount",partNo:"MM216378",code:415,unit:"No",rate:1.23,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"af43",desc:"Filter Ventilator 109x109 19m³/h IP54",partNo:"IUKNF1523A",code:415,unit:"No",rate:32.85,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af44",desc:"Exhaust Filter 109x109mm IP54",partNo:"IUKNE150",code:415,unit:"No",rate:8.25,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af45",desc:"Narrow Industrial Relay 2CO 24VAC 5A",partNo:"RXT21R24",code:415,unit:"No",rate:2.22,labour:0,qty:5,markup:1,workPkg:"3"},
    {id:"af46",desc:"Screw Socket 2-pole RXT relay",partNo:"YRXT2010",code:415,unit:"No",rate:1.05,labour:0,qty:5,markup:1,workPkg:"3"},
    {id:"af47",desc:"Panel Building",partNo:"",code:420,unit:"No",rate:600.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"af48",desc:"Panel Consumables (labels, tags, etc.)",partNo:"",code:875,unit:"No",rate:100.00,labour:0,qty:1,markup:1,workPkg:"3"},
  ]},
  {id:"b_hru",name:"Heat Recovery Unit",category:"Integrated Systems",description:"ECY-303 with field devices and panel",lines:[
    {id:"h1",desc:"ECY-303 Connected Equipment Controller (SI)",partNo:"ECY-303 (SI)",code:410,unit:"No",rate:503.48,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"h2",desc:"Duct/Immersion Temp Sensor 300mm NTC10K",partNo:"TS-DI 300",code:416,unit:"No",rate:25,labour:0.75,qty:1,markup:1,workPkg:"3"},
    {id:"h3",desc:"Air Differential Pressure Switch 100-1500Pa",partNo:"PS-DPS1500",code:416,unit:"No",rate:25,labour:0.75,qty:1,markup:1,workPkg:"3"},
    {id:"h4",desc:"Pressure Transducer 500Pa",partNo:"DS-DPA2500VV",code:416,unit:"No",rate:99.39,labour:0.75,qty:1,markup:1,workPkg:"3"},
    {id:"h5",desc:"Air Volume Sensor",partNo:"TPAVT8/10",code:416,unit:"No",rate:101,labour:0.75,qty:1,markup:1,workPkg:"3"},
    {id:"h6",desc:"Wall-mounted Enclosure IP65 600x600x155mm",partNo:"",code:415,unit:"No",rate:110,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"h7",desc:"Control Transformer 230V/24V 100VA",partNo:"LP612010T",code:415,unit:"No",rate:27.29,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"h8",desc:"Panel & Enclosure Consumables",partNo:"Mark Catania",code:875,unit:"No",rate:20,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"h9",desc:"Containment — Signal Cable",partNo:"",code:412,unit:"m",rate:3.66,labour:0.2,qty:50,markup:1,workPkg:"3"},
    {id:"h10",desc:"3c 0.75mm Signal Cable",partNo:"",code:412,unit:"m",rate:0.55,labour:0.1,qty:100,markup:1,workPkg:"3"},
    {id:"h11",desc:"Panel Building & Installation",partNo:"Mark Catania",code:420,unit:"No",rate:250,labour:2,qty:1,markup:1,workPkg:"3"},
    {id:"h12",desc:"Programming — Per Point (AGV)",partNo:"",code:421,unit:"pt",rate:0,labour:0.5,qty:16,markup:1,workPkg:"3"},
  ]},
  {id:"b_bms_software",name:"BMS Supervisor Software (EC-Net)",category:"Integrated Systems",description:"EC-Net Supervisor licences, integration pack, designer and installation",lines:[
    {id:"bs1",desc:"EC-Net Supervisor 0",partNo:"",code:512,unit:"No",rate:506.16,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"bs2",desc:"EC-Net Supervisor 0 — 18 Month SMA",partNo:"",code:512,unit:"No",rate:90.92,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"bs3",desc:"EC-Net Supervisor Integration Pack 2500",partNo:"",code:512,unit:"No",rate:2118.12,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"bs4",desc:"EC-Net Designer 1250",partNo:"",code:512,unit:"No",rate:551.76,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"bs5",desc:"Installation of Software — BMS Engineer",partNo:"",code:902,unit:"hr",rate:32,labour:0,qty:4,markup:1,workPkg:"3"},
  ]},
  {id:"b_bms_server",name:"BMS Server",category:"Integrated Systems",description:"Server, UPS and rack mount kit with installation",lines:[
    {id:"bsv1",desc:"Server for BMS Software",partNo:"",code:821,unit:"No",rate:1500,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"bsv2",desc:"UPS for BMS Server",partNo:"",code:820,unit:"No",rate:1500,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"bsv3",desc:"Rack Mount Kit for BMS Server",partNo:"",code:821,unit:"No",rate:0,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"bsv4",desc:"Installation of Server — BMS Engineer",partNo:"",code:902,unit:"hr",rate:32,labour:0,qty:8,markup:1,workPkg:"3"},
  ]},
  {id:"b_ip_network",name:"Engineering IP Network",category:"Integrated Systems",description:"Helmholtz 16-port DIN rail switch + UPS; Cat 6 qty to be set per job",lines:[
    {id:"ipn1",desc:"Helmholtz 16-Port Switch — DIN Rail",partNo:"",code:821,unit:"No",rate:2000,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ipn2",desc:"UPS for IP Network",partNo:"",code:820,unit:"No",rate:0,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ipn3",desc:"Cat 6 Cable Installation — AGV",partNo:"",code:414,unit:"hr",rate:24.288,labour:0,qty:0,markup:1,workPkg:"3"},
  ]},
  {id:"b_3way",name:"3-Way Diverting Valve Panel",category:"Control Panels",description:"Panel with Belimo 3-way valve and actuator",lines:[
    {id:"tv1",desc:"Field Device — Float Switch",partNo:"",code:416,unit:"No",rate:25,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"tv2",desc:"Selector Switch 3-pos Stay-put",partNo:"MM216872",code:415,unit:"No",rate:8,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"tv3",desc:"LED Indicator Red 230VAC",partNo:"BZ501215-B",code:415,unit:"No",rate:0.98,labour:0,qty:6,markup:1,workPkg:"3"},
    {id:"tv4",desc:"Mini Contactor 3NO+1NC 20A 230VAC",partNo:"LA100923",code:415,unit:"No",rate:12.15,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"tv5",desc:"MCB DC-C2/1 10kA",partNo:"BM015102",code:415,unit:"No",rate:8.5,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"tv6",desc:"Wall-mounted Enclosure IP65 600x400x155mm",partNo:"WSA6040150",code:415,unit:"No",rate:72.35,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"tv7",desc:"Wall-mounting Brackets",partNo:"WSAWB004",code:415,unit:"No",rate:3.43,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"tv8",desc:"Knitted Earthing Cable 260mm",partNo:"WSTCUF260",code:415,unit:"No",rate:2.55,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"tv9",desc:"Accessories",partNo:"",code:875,unit:"No",rate:25,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"tv10",desc:"Panel Building",partNo:"",code:420,unit:"No",rate:150,labour:2,qty:2,markup:1,workPkg:"3"},
    {id:"tv11",desc:"Signal Cable and Containment",partNo:"",code:412,unit:"m",rate:2.5,labour:0.15,qty:90,markup:1,workPkg:"3"},
    {id:"tv12",desc:"Belimo 3-Way Valve incl Delivery",partNo:"H7100R",code:416,unit:"No",rate:1361.25,labour:0,qty:2,markup:1.05,workPkg:"3"},
    {id:"tv13",desc:"Belimo Actuator ON/OFF — Labour only",partNo:"EV230A-TPC",code:416,unit:"No",rate:0,labour:2,qty:2,markup:1,workPkg:"3"},
  ]},
  {id:"b_field",name:"General Field Equipment",category:"Field Equipment",description:"Field devices — attach to any DDC",lines:[
    {id:"fd_g1",desc:"Flood Sensor (WDC Leak Module + WLM Cable 5m + PSU + Enclosure)",partNo:"SNS Middle East",code:416,unit:"No",rate:108.9,labour:2,qty:2,markup:1,workPkg:"3"},
    {id:"fd_g2",desc:"Contactor 3-pole CUBICO 5.5kW 12A 24VAC",partNo:"LZDC12B0",code:416,unit:"No",rate:25,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"fd_g3",desc:"Digital 1-Channel Day/Week Timer",partNo:"BZH14071",code:415,unit:"No",rate:24.4,labour:0.5,qty:1,markup:1,workPkg:"3"},
  ]},
  {id:"b_rainwater_valve",name:"Rainwater Diverting Valve",category:"Field Equipment",description:"DN150 diverting valve — standalone",lines:[
    {id:"rv1",desc:"Diverting Valve DN150",partNo:"D6150W/JRCA-S2-T",code:416,unit:"No",rate:890.5,labour:2,qty:1,markup:1.05,workPkg:"3"},
  ]},
  {id:"b_level",name:"Level Sensor for Tanks",category:"Field Equipment",description:"Nivelco hydrostatic level sensors",lines:[
    {id:"ls1",desc:"Level Sensor — Nivelco Nivopress Hydrostatic",partNo:"",code:416,unit:"No",rate:300,labour:4,qty:4,markup:1.05,workPkg:"3"},
  ]},
  {id:"b_solenoid",name:"Solenoid Valve for Potable Tanks",category:"Field Equipment",description:"DN50 solenoid valves",lines:[
    {id:"sv1",desc:"Solenoid Valve DN50",partNo:"SNS - GSW 32/230AC",code:416,unit:"No",rate:136.2,labour:2,qty:2,markup:1.05,workPkg:"3"},
  ]},
  {id:"b_3way_ls",name:"3-Way Valve + Actuator with Limit Switches (DN100)",category:"Field Equipment",description:"Belimo DN100 PN16 with aux switch pair",lines:[
    {id:"tw1",desc:"3-Way Valve DN100 PN16",partNo:"H765N",code:416,unit:"No",rate:1067.50,labour:2,qty:1,markup:1.01,workPkg:"3"},
    {id:"tw2",desc:"Actuator for 3-Way Valve with Aux (2No.)",partNo:"AVK24A-SR-TPC",code:416,unit:"No",rate:761.00,labour:0,qty:1,markup:1.01,workPkg:"3"},
    {id:"tw3",desc:"Pair Aux Switch",partNo:"S2A-H",code:416,unit:"No",rate:72.00,labour:0,qty:1,markup:1.01,workPkg:"3"},
  ]},
  {id:"b_temp_sensor",name:"Temperature Sensor and Pocket (Distech)",category:"Field Equipment",description:"TS-DI 100 resistive transducer with 100mm pocket",lines:[
    {id:"ts1",desc:"Temperature Transducer — Resistive",partNo:"TS-DI 100",code:416,unit:"No",rate:13.68,labour:0.75,qty:1,markup:1,workPkg:"3"},
    {id:"ts2",desc:"Temperature Pocket 100mm",partNo:"TS-THVADS100",code:416,unit:"No",rate:13.67,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ts3",desc:"Transport — Distech Courier",partNo:"",code:962,unit:"No",rate:80.00,labour:0,qty:1,markup:1,workPkg:"3"},
  ]},
  {id:"b_inverter_bare",name:"Inverter — No Panel (Fuji Frenic-Aqua)",category:"Field Equipment",description:"Standalone inverter supply, transport, termination and programming",lines:[
    {id:"inv1",desc:"Frenic-Aqua 15kW",partNo:"FRN15AQ1L-4E",code:416,unit:"No",rate:1100.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"inv2",desc:"Transport",partNo:"",code:962,unit:"No",rate:120.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"inv3",desc:"Termination, Point Testing & FAT — AGV",partNo:"",code:421,unit:"hr",rate:24.288,labour:0,qty:4,markup:1,workPkg:"3"},
    {id:"inv4",desc:"Programming — Pump Set Operation — BMS Engineer",partNo:"",code:902,unit:"hr",rate:32,labour:0,qty:4,markup:1,workPkg:"3"},
  ]},
  {id:"b_inv_enclosure_modbus",name:"Inverter Block with Enclosure and Modbus",category:"Field Equipment",description:"Fuji AQUA VSD + ETAS enclosure + panel components + cabling + AGV labour",lines:[
    {id:"ib1",desc:"Fuji AQUA VSD 37kW IP21 incl EMC-Filter, DC-reactor, operator panel",partNo:"FRN37AQ1M-4E",code:416,unit:"No",rate:1503.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ib2",desc:"Wall-mounted Enclosure IP66 800x600x400mm",partNo:"WSA8060400",code:415,unit:"No",rate:182.90,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ib3",desc:"Motor Protection Circuit Breaker 3-pole 55-63A",partNo:"BE663000",code:415,unit:"No",rate:65.31,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ib4",desc:"Auxiliary Contact Front 1NO+1NC",partNo:"BE082882",code:415,unit:"No",rate:3.43,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ib5",desc:"Exhaust Filter 252x252x38mm IP54",partNo:"IUKNE450",code:415,unit:"No",rate:16.29,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ib6",desc:"Low Level Cables",partNo:"",code:412,unit:"No",rate:56.85,labour:0,qty:4,markup:1,workPkg:"3"},
    {id:"ib7",desc:"Labour — Installation & Wiring (AGV)",partNo:"",code:900,unit:"hr",rate:24.288,labour:0,qty:16,markup:1,workPkg:"3"},
    {id:"ib8",desc:"Modbus Cable",partNo:"",code:413,unit:"No",rate:60.69,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ib9",desc:"Labour — Modbus Termination & Commissioning (AGV)",partNo:"",code:900,unit:"hr",rate:24.288,labour:0,qty:4,markup:1,workPkg:"3"},
    {id:"ib10",desc:"Consumables",partNo:"",code:875,unit:"No",rate:50.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"ib11",desc:"Panel Building",partNo:"",code:420,unit:"No",rate:0,labour:2,qty:1,markup:1,workPkg:"3"},
  ]},
  {id:"b_conductivity",name:"Conductivity Sensor (GF, per sensor)",category:"Field Equipment",description:"GF conductivity transmitter, probe, clamps, mounting and transport",lines:[
    {id:"cs1",desc:"Conductivity Sensor — Transmitter",partNo:"GF-159001699",code:416,unit:"No",rate:205.26,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"cs2",desc:"Conductivity Sensor — Probe",partNo:"GF-159001816",code:416,unit:"No",rate:328.72,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"cs3",desc:"Conductivity Sensor — Clamps",partNo:"GF-727627112",code:416,unit:"No",rate:19.80,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"cs4",desc:"Conductivity Sensor — Mounting",partNo:"GF-159000184",code:416,unit:"No",rate:64.41,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"cs5",desc:"Point Testing",partNo:"",code:902,unit:"No",rate:0,labour:0.50,qty:1,markup:1,workPkg:"3"},
    {id:"cs6",desc:"Terminations",partNo:"",code:902,unit:"No",rate:0,labour:0.13,qty:2,markup:1,workPkg:"3"},
    {id:"cs7",desc:"Conductivity Sensor — Transport",partNo:"GF-159000184",code:416,unit:"No",rate:132.60,labour:0,qty:1,markup:1,workPkg:"3"},
  ]},
  {id:"b_temp_distech",name:"Temp Sensor with Distech Input Module",category:"Field Equipment",description:"TS-DI V sensors with brass pockets and ECY-8UI module",lines:[
    {id:"td1",desc:"Temperature Sensor",partNo:"TS-DI V",code:416,unit:"No",rate:75.38,labour:0,qty:8,markup:1,workPkg:"3"},
    {id:"td2",desc:"Temperature Pocket — Brass",partNo:"",code:416,unit:"No",rate:20.00,labour:0,qty:8,markup:1,workPkg:"3"},
    {id:"td3",desc:"ECY-8UI Input Module",partNo:"",code:411,unit:"No",rate:206.34,labour:1,qty:1,markup:1,workPkg:"3"},
    {id:"td4",desc:"Point Testing",partNo:"",code:902,unit:"No",rate:0,labour:0.50,qty:8,markup:1,workPkg:"3"},
    {id:"td5",desc:"Terminations",partNo:"",code:902,unit:"No",rate:0,labour:0.13,qty:16,markup:1,workPkg:"3"},
  ]},
  {id:"b_water_meter",name:"Water Meter (DN40 Cold)",category:"Field Equipment",description:"Bmeters GMDM-I DN40 cold water meter + pulse interface",lines:[
    {id:"wm1",desc:"GMDM-I Water Meter + Connector Set DN40 Cold",partNo:"",code:416,unit:"No",rate:153.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"wm2",desc:"IWM-PL3 Pulse Interface",partNo:"IWM-PL3",code:416,unit:"No",rate:30.00,labour:0,qty:1,markup:1,workPkg:"3"},
  ]},
  {id:"b_pressure_transducer",name:"Pressure Transducer 0-10 bar",category:"Field Equipment",description:"Distech fluid pressure transducer G1/2\" with manual quarter-turn valve",lines:[
    {id:"pt1",desc:"Fluid Pressure Transducer 0-10 bar G1/2\" 0-10V",partNo:"PS-DLF10 V G1/2\"",code:416,unit:"No",rate:108.30,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"pt2",desc:"Quarter Turn Valve (manual)",partNo:"",code:416,unit:"No",rate:15.00,labour:0,qty:1,markup:1,workPkg:"3"},
  ]},
  {id:"b_siemens_heat_meter",name:"Siemens Heat Meter (UH50 Ultrasonic)",category:"Field Equipment",description:"UH50-C74-00 ultrasonic heat/cold meter with MBus card and sensor pockets",lines:[
    {id:"sh1",desc:"UH50-C74-00 Ultrasonic Heat Meter 40m³/h",partNo:"UH50-C74-00",code:416,unit:"No",rate:1720.47,labour:2,qty:1,markup:1,workPkg:"3"},
    {id:"sh2",desc:"WZU-MBG4 MBus G4 Card for UH50",partNo:"WZU-MBG4",code:416,unit:"No",rate:48.69,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"sh3",desc:"WZT-S150 Sensor Pocket 150mm",partNo:"WZT-S150",code:416,unit:"No",rate:40.74,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"sh4",desc:"WZU-BD-HALT",partNo:"WZU-BD-HALT",code:416,unit:"No",rate:75.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"sh5",desc:"Shipping — Siemens / AJ Electric",partNo:"",code:962,unit:"No",rate:50.00,labour:0,qty:1,markup:1,workPkg:"3"},
  ]},
  {id:"b_wdps",name:"Water Differential Pressure Switch (WDPS + Pipe)",category:"Field Equipment",description:"WDPS combined with pipe",lines:[
    {id:"wd1",desc:"Water Differential Pressure Switch + Pipe",partNo:"PS-PL-FD113",code:416,unit:"No",rate:110.63,labour:0.25,qty:1,markup:1,workPkg:"3"},
  ]},
  {id:"b_ultrasonic_level",name:"Ultrasonic Level Sensor",category:"Field Equipment",description:"Ultrasonic level sensor",lines:[
    {id:"ul1",desc:"Ultrasonic Level Sensor",partNo:"",code:416,unit:"No",rate:452.41,labour:0,qty:1,markup:1,workPkg:"3"},
  ]},
  {id:"b_zen_dali",name:"ZenDALI and Switches / PIRs",category:"Misc Blocks",description:"Zencontrol DALI system",lines:[
    {id:"zd1",desc:"DALI Application Controller + Ethernet Gateway",partNo:"zc-controller #19029",code:417,unit:"No",rate:188.08,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"zd2",desc:"DALI Application Controller + Gateway 6DIN 3-line",partNo:"zc-controller-pro-3 #53289",code:417,unit:"No",rate:389.54,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"zd3",desc:"DALI-2 Power Supply DIN Mount",partNo:"zc-psu #19247",code:417,unit:"No",rate:49.84,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"zd4",desc:"PIR Sensor 5m with Recess Mounting",partNo:"zc-pir-5m-bp #53233",code:417,unit:"No",rate:36.59,labour:0,qty:0,markup:1,workPkg:"3"},
    {id:"zd5",desc:"Standard Sceneset Switch Plate 60mm",partNo:"zc-sceneset-a4 #53058",code:417,unit:"No",rate:58.44,labour:0,qty:0,markup:1,workPkg:"3"},
    {id:"zd6",desc:"Brushed Stainless Faceplate for Sceneset",partNo:"zc-scnset-fp-st #53045",code:417,unit:"No",rate:9.80,labour:0,qty:0,markup:1,workPkg:"3"},
    {id:"zd7",desc:"DALI Volt-free Relay DIN Mount",partNo:"zc-relay #19028",code:417,unit:"No",rate:39.04,labour:0,qty:0,markup:1,workPkg:"3"},
    {id:"zd8",desc:"DALI-2 Switch Input Module",partNo:"zc-switch-bp #53235",code:417,unit:"No",rate:24.25,labour:0,qty:0,markup:1,workPkg:"3"},
    {id:"zd9",desc:"Enclosure",partNo:"",code:415,unit:"No",rate:50.00,labour:0,qty:1,markup:1,workPkg:"3"},
    {id:"zd10",desc:"Panel Building",partNo:"",code:420,unit:"No",rate:80.00,labour:0,qty:1,markup:1,workPkg:"3"},
  ]},
  {id:"b_tenant_pharmacy",name:"Tenant Fit-Out: Wireless Sensing + Engineering (Pharmacy)",category:"Misc Blocks",description:"Trident Park pharmacy template — wireless sensors, repeater, CO2, batteries + BMS engineering hours",lines:[
    {id:"tp1",desc:"Space Temperature Sensor — Wireless Solar 868MHz 1m",partNo:"WI-SR65 TF 050.06 L1000",code:416,unit:"No",rate:111.11,labour:0.25,qty:9,markup:1,workPkg:"3"},
    {id:"tp2",desc:"Room Temp & Humidity Sensor",partNo:"WI-754057",code:416,unit:"No",rate:127.17,labour:0.25,qty:9,markup:1,workPkg:"3"},
    {id:"tp3",desc:"Wireless Repeater 230V",partNo:"",code:416,unit:"No",rate:99.64,labour:0.25,qty:2,markup:1,workPkg:"3"},
    {id:"tp4",desc:"Batteries",partNo:"",code:416,unit:"No",rate:6.90,labour:0,qty:18,markup:1,workPkg:"3"},
    {id:"tp5",desc:"Duct CO2 Sensor",partNo:"GS-D TCO2 AA",code:416,unit:"No",rate:219.59,labour:0.50,qty:2,markup:1,workPkg:"3"},
    {id:"tp6",desc:"TABS Config — BMS Engineer",partNo:"",code:902,unit:"LS",rate:32,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"tp7",desc:"VAV Config — BMS Engineer",partNo:"",code:902,unit:"LS",rate:32,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"tp8",desc:"New Tenant BMS Page — BMS Engineer",partNo:"",code:902,unit:"LS",rate:32,labour:0,qty:2,markup:1,workPkg:"3"},
    {id:"tp9",desc:"Belimo Config — BMS Engineer",partNo:"",code:902,unit:"LS",rate:32,labour:0,qty:2,markup:1,workPkg:"3"},
  ]},
  ...FIELD_DEVICES.map(fd=>({
    id:`b_${fd.id}`,name:fd.desc,category:"Common Field Devices",description:"Belimo field device — qty 1, adjust per job",
    lines:[{id:`l_${fd.id}`,desc:fd.desc,partNo:fd.partNo,code:416,unit:"No",rate:fd.rate,labour:0,qty:1,markup:1,workPkg:"3"}]
  })),
];

let _uid = 3000;
const uid = () => `id_${_uid++}`;
const fmt = n => isNaN(n)||n===null?"€0.00":"€"+Number(n).toLocaleString("en-GB",{minimumFractionDigits:2,maximumFractionDigits:2});

const S = {
  inp:{border:"1px solid #d1d5db",borderRadius:4,padding:"4px 7px",fontSize:12,outline:"none",background:"#fff",boxSizing:"border-box",width:"100%"},
  btn:(bg="#1a2e4a",pad="7px 14px")=>({background:bg,color:"#fff",border:"none",borderRadius:5,padding:pad,cursor:"pointer",fontSize:12,fontWeight:600}),
  ghost:{border:"1px solid #d1d5db",background:"#fff",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:12},
  micro:{border:"1px solid #e2e8f0",background:"#fff",borderRadius:3,padding:"2px 5px",cursor:"pointer",fontSize:11,color:"#555"},
};

function parseCsv(text) {
  const rows=[];const lines=text.split(/\r?\n/);
  for(const line of lines){
    if(!line.trim())continue;
    const cols=[];let cur="",inQ=false;
    for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){inQ=!inQ;}else if(c===','&&!inQ){cols.push(cur.trim());cur="";}else cur+=c;}
    cols.push(cur.trim());rows.push(cols);
  }
  return rows;
}
function parsePrice(v){if(!v)return null;const n=parseFloat(String(v).replace(/[^0-9.]/g,""));return isNaN(n)?null:n;}

export default function App() {
  const [tab,setTab]=useState(0);
  const [blocks,setBlocks]=useState(INITIAL_BLOCKS);
  const [estimate,setEstimate]=useState({project:"",client:"",ref:"",date:new Date().toISOString().slice(0,10),notes:"",rows:[]});
  const [priceList,setPriceList]=useState([]);
  const fileRef=useRef();

  const loadCsv=(e)=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      const rows=parseCsv(ev.target.result);if(rows.length<2)return;
      const items=rows.slice(1).map(r=>({supplier:r[0]||"",desc:r[1]||"",partNo:r[2]||"",listPrice:parsePrice(r[3]),netPrice:parsePrice(r[4]),extra:r[5]||""})).filter(i=>i.desc||i.partNo);
      setPriceList(items);
    };
    reader.readAsText(file);
  };

  return (
    <div style={{fontFamily:"Segoe UI,sans-serif",fontSize:13,background:"#f0f2f5",minHeight:"100vh"}}>
      <div style={{background:"#1a2e4a",color:"#fff",padding:"12px 24px",display:"flex",alignItems:"center",gap:16}}>
        <span style={{fontSize:17,fontWeight:700}}>⚙ BMS Estimating Tool</span>
        <div style={{marginLeft:24,display:"flex",alignItems:"center",gap:8}}>
          <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={loadCsv}/>
          <button onClick={()=>fileRef.current.click()} style={{...S.btn("#2e5c8a","5px 12px"),fontSize:11}}>
            📂 {priceList.length>0?`Price List Loaded (${priceList.length} items)`:"Load Price List CSV"}
          </button>
          {priceList.length>0&&<button onClick={()=>setPriceList([])} style={{...S.btn("#7a2a2a","4px 10px"),fontSize:11}}>✕ Clear</button>}
        </div>
        <span style={{marginLeft:"auto",fontSize:11,opacity:0.5}}>Panta Contracting Limited · v2.5 · Guy · 13 Mar 2026</span>
      </div>
      <div style={{background:"#fff",borderBottom:"2px solid #e2e8f0",display:"flex",paddingLeft:24}}>
        {["Estimate Builder","Block Library"].map((t,i)=>(
          <button key={i} onClick={()=>setTab(i)} style={{padding:"10px 20px",border:"none",background:"none",cursor:"pointer",fontWeight:i===tab?700:400,color:i===tab?"#1a2e4a":"#666",borderBottom:i===tab?"3px solid #1a2e4a":"3px solid transparent",fontSize:13,marginBottom:-2}}>{t}</button>
        ))}
      </div>
      <div style={{padding:20}}>
        {tab===0?<Builder blocks={blocks} estimate={estimate} setEstimate={setEstimate} priceList={priceList}/>:<Library blocks={blocks} setBlocks={setBlocks}/>}
      </div>
    </div>
  );
}

function PriceListSearch({priceList,onAdd}) {
  const [q,setQ]=useState("");
  const [sf,setSf]=useState("All");
  const suppliers=useMemo(()=>["All",...Array.from(new Set(priceList.map(i=>i.supplier).filter(Boolean))).sort()],[priceList]);
  const results=useMemo(()=>{
    if(!q.trim())return[];const lq=q.toLowerCase();
    return priceList.filter(i=>(sf==="All"||i.supplier===sf)&&(i.desc.toLowerCase().includes(lq)||i.partNo.toLowerCase().includes(lq))).slice(0,50);
  },[q,sf,priceList]);
  const getRate=i=>i.netPrice??i.listPrice??0;
  const sc=s=>s==="Fuji"?"#e8f0fe":s==="Belimo"?"#e8f5e9":s==="Distech"?"#fff3e0":"#f5f5f5";
  return(
    <div style={{background:"#f0f6ff",border:"1px solid #a0bce0",borderRadius:6,padding:14,marginBottom:12}}>
      <div style={{fontWeight:700,color:"#1a2e4a",fontSize:13,marginBottom:10}}>🔍 Price List Search</div>
      <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
        <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Type description or part number…" style={{...S.inp,flex:1,minWidth:200,fontSize:13}}/>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {suppliers.map(s=><button key={s} onClick={()=>setSf(s)} style={{padding:"4px 10px",borderRadius:4,border:"1px solid #cbd5e1",background:sf===s?"#1a2e4a":"#fff",color:sf===s?"#fff":"#333",cursor:"pointer",fontSize:11,fontWeight:sf===s?700:400}}>{s}</button>)}
        </div>
      </div>
      {!q.trim()&&<div style={{color:"#aaa",fontSize:12,padding:"8px 0"}}>Start typing to search across {priceList.length.toLocaleString()} items…</div>}
      {q.trim()!==''&&results.length===0&&<div style={{color:"#aaa",fontSize:12,padding:"8px 0"}}>No results found.</div>}
      {results.length>0&&(
        <div style={{maxHeight:280,overflowY:"auto",borderRadius:4,border:"1px solid #e2e8f0"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{background:"#f1f5f9",position:"sticky",top:0}}>
              {["Supplier","Description","Part No","Net Price","Extra",""].map((h,i)=><th key={i} style={{padding:"5px 8px",textAlign:i===3?"right":"left",fontWeight:600,color:"#555"}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {results.map((item,i)=>(
                <tr key={i} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#fafbfc"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#eef4ff"}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#fafbfc"}>
                  <td style={{padding:"5px 8px"}}><span style={{background:sc(item.supplier),borderRadius:3,padding:"2px 6px",fontSize:10,fontWeight:600}}>{item.supplier}</span></td>
                  <td style={{padding:"5px 8px",maxWidth:280}}>{item.desc}</td>
                  <td style={{padding:"5px 8px",color:"#555",fontFamily:"monospace",fontSize:11}}>{item.partNo}</td>
                  <td style={{padding:"5px 8px",textAlign:"right",fontWeight:700,color:"#1a2e4a"}}>{fmt(getRate(item))}</td>
                  <td style={{padding:"5px 8px",color:"#aaa",fontSize:11}}>{item.extra}</td>
                  <td style={{padding:"5px 8px"}}><button onClick={()=>onAdd(item)} style={{...S.btn("#4a6741","3px 10px"),fontSize:11}}>+ Add</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {results.length===50&&<div style={{padding:"6px 10px",fontSize:11,color:"#aaa",background:"#f8fafc"}}>Showing first 50 — refine search to narrow down.</div>}
        </div>
      )}
    </div>
  );
}

function Builder({blocks,estimate,setEstimate,priceList}) {
  const [pickerState,setPickerState]=useState(null);
  const [pickerCat,setPickerCat]=useState("All");
  const [pendingName,setPendingName]=useState("");
  const [showFdPicker,setShowFdPicker]=useState(false);
  const [fdSearch,setFdSearch]=useState("");
  const [showExport,setShowExport]=useState(false);
  const [showPriceSearch,setShowPriceSearch]=useState(false);

  const upd=(k,v)=>setEstimate(e=>({...e,[k]:v}));
  const addBlockRows=(block,headerName)=>{
    const lines=block.lines.map(l=>({type:"line",...l,id:uid()}));
    if(headerName){setEstimate(e=>({...e,rows:[...e.rows,{type:"header",id:uid(),label:headerName},...lines]}));}
    else{setEstimate(e=>({...e,rows:[...e.rows,...lines]}));}
    setPickerState(null);setPendingName("");setPickerCat("All");
  };
  const addFieldDevice=(fd)=>{
    setEstimate(e=>({...e,rows:[...e.rows,{type:"line",id:uid(),desc:fd.desc,partNo:fd.partNo,code:416,unit:"No",rate:fd.rate,labour:0,qty:1,markup:1,workPkg:"3"}]}));
    setShowFdPicker(false);setFdSearch("");
  };
  const addPriceListItem=(item)=>{
    const rate=item.netPrice??item.listPrice??0;
    setEstimate(e=>({...e,rows:[...e.rows,{type:"line",id:uid(),desc:item.desc,partNo:item.partNo,code:416,unit:"No",rate,labour:0,qty:1,markup:1,workPkg:"3"}]}));
  };
  const addBlankLine=()=>setEstimate(e=>({...e,rows:[...e.rows,{type:"line",id:uid(),desc:"",partNo:"",code:900,unit:"hr",rate:0,labour:0,qty:1,markup:1,workPkg:""}]}));
  const updRow=(id,k,v)=>setEstimate(e=>({...e,rows:e.rows.map(r=>r.id===id?{...r,[k]:v}:r)}));
  const removeRow=(id)=>setEstimate(e=>({...e,rows:e.rows.filter(r=>r.id!==id)}));
  const moveRow=(id,dir)=>setEstimate(e=>{
    const arr=[...e.rows];const i=arr.findIndex(r=>r.id===id);const j=i+dir;
    if(j<0||j>=arr.length)return e;[arr[i],arr[j]]=[arr[j],arr[i]];return{...e,rows:arr};
  });
  const lineRows=estimate.rows.filter(r=>r.type==="line");
  const rateTotal=lineRows.reduce((s,l)=>s+l.qty*l.rate*(l.markup||1),0);
  const labourTotal=lineRows.reduce((s,l)=>s+l.qty*l.labour,0);
  const grandTotal=rateTotal+labourTotal;
  const buildCsv=()=>{
    const q=v=>`"${String(v==null?"":v).replace(/"/g,'""')}"`;
    const row=arr=>arr.map(q).join(",");
    const out=[row(["Qty","Unit","Description","Part No","Job Ref","Code","(__)","Work Pkg","Rate","Rate Total","Labour","Labour Total"])];
    estimate.rows.forEach(r=>{
      if(r.type==="header"){out.push(row([`*** ${r.label} ***`,"","","","","","","","","","",""]));}
      else{const rt=(r.qty*r.rate*(r.markup||1)).toFixed(2);const lt=(r.qty*r.labour).toFixed(2);
        out.push(row([r.qty,r.unit,r.desc,r.partNo||"",estimate.ref||"BMSE_001",r.code,"(__)",r.workPkg||"",r.rate,rt,r.labour,lt]));}
    });
    out.push(row(["","","","","","","","","","","",""]));
    out.push(row(["","","","","","","","","","Rate Total","",rateTotal.toFixed(2)]));
    out.push(row(["","","","","","","","","","Labour Total","",labourTotal.toFixed(2)]));
    out.push(row(["","","","","","","","","","GRAND TOTAL","",grandTotal.toFixed(2)]));
    return out.join("\n");
  };
  const filteredFd=FIELD_DEVICES.filter(fd=>!fdSearch||fd.desc.toLowerCase().includes(fdSearch.toLowerCase())||fd.partNo.toLowerCase().includes(fdSearch.toLowerCase()));
  const pickerBlocks=blocks.filter(b=>(pickerCat==="All"||b.category===pickerCat)&&b.category!=="Common Field Devices");

  return(
    <div style={{display:"flex",gap:18,alignItems:"flex-start"}}>
      <div style={{flex:1,minWidth:0}}>
        <Card title="Project Details">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
            {[["project","Project / Site"],["client","Client"],["ref","Reference No."],["date","Date","date"]].map(([k,label,type])=>(
              <div key={k}><Label>{label}</Label><input type={type||"text"} value={estimate[k]} onChange={e=>upd(k,e.target.value)} style={S.inp}/></div>
            ))}
          </div>
        </Card>
        <Card title="Estimate Lines">
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
            <button onClick={()=>{setPickerState({step:"name"});setPendingName("");setShowFdPicker(false);setShowPriceSearch(false);}} style={S.btn()}>+ Add Section &amp; Block</button>
            <button onClick={()=>{setPickerState({step:"block"});setShowFdPicker(false);setShowPriceSearch(false);}} style={S.btn("#2a4e7a")}>+ Add Block</button>
            <button onClick={()=>{setShowFdPicker(p=>!p);setPickerState(null);setShowPriceSearch(false);}} style={S.btn("#5a7a4a")}>+ Field Device</button>
            {priceList.length>0&&<button onClick={()=>{setShowPriceSearch(p=>!p);setPickerState(null);setShowFdPicker(false);}} style={S.btn(showPriceSearch?"#2a5a8a":"#3a6a9a")}>🔍 Price List Search</button>}
            <button onClick={addBlankLine} style={S.btn("#4a6741")}>+ Blank Line</button>
            {estimate.rows.length>0&&<button onClick={()=>setShowExport(p=>!p)} style={S.btn("#7c4d14")}>📋 Export CSV</button>}
          </div>
          {showPriceSearch&&priceList.length>0&&<PriceListSearch priceList={priceList} onAdd={addPriceListItem}/>}
          {showFdPicker&&(
            <div style={{background:"#f0f6f0",border:"1px solid #8ab08a",borderRadius:6,padding:12,marginBottom:12}}>
              <div style={{fontWeight:700,color:"#2a5a2a",fontSize:12,marginBottom:8}}>Select Field Device — adds at qty 1 directly to estimate</div>
              <input autoFocus value={fdSearch} onChange={e=>setFdSearch(e.target.value)} placeholder="Search by description or part no…" style={{...S.inp,marginBottom:8}}/>
              <div style={{maxHeight:200,overflowY:"auto"}}>
                {filteredFd.map(fd=>(
                  <div key={fd.id} onClick={()=>addFieldDevice(fd)}
                    style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 8px",cursor:"pointer",background:"#fff",border:"1px solid #e2e8f0",borderRadius:4,marginBottom:4}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor="#2a5a2a"}
                    onMouseLeave={e=>e.currentTarget.style.borderColor="#e2e8f0"}>
                    <div><div style={{fontSize:12,fontWeight:600,color:"#1a2e4a"}}>{fd.desc}</div><div style={{fontSize:11,color:"#888"}}>{fd.partNo}</div></div>
                    <div style={{fontWeight:700,color:"#4a6741",fontSize:12,marginLeft:12,whiteSpace:"nowrap"}}>{fmt(fd.rate)}</div>
                  </div>
                ))}
                {filteredFd.length===0&&<div style={{color:"#aaa",padding:8}}>No devices found.</div>}
              </div>
              <button onClick={()=>{setShowFdPicker(false);setFdSearch("");}} style={{...S.ghost,marginTop:8,fontSize:11}}>Close</button>
            </div>
          )}
          {pickerState?.step==="name"&&(
            <div style={{background:"#fffbea",border:"1px solid #f0d060",borderRadius:6,padding:14,marginBottom:12}}>
              <div style={{fontWeight:700,color:"#7c4d14",marginBottom:8,fontSize:13}}>Step 1 — Name this section</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input autoFocus value={pendingName} onChange={e=>setPendingName(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&pendingName.trim())setPickerState({step:"block"});}}
                  placeholder="e.g. AHU-01 — Heat Recovery Unit" style={{...S.inp,flex:1,fontSize:13}}/>
                <button onClick={()=>{if(pendingName.trim())setPickerState({step:"block"});}} disabled={!pendingName.trim()} style={S.btn(pendingName.trim()?"#1a2e4a":"#aaa")}>Next →</button>
                <button onClick={()=>{setPickerState(null);setPendingName("");}} style={S.ghost}>Cancel</button>
              </div>
            </div>
          )}
          {pickerState?.step==="block"&&(
            <div style={{background:"#f0f6ff",border:"1px solid #a0bce0",borderRadius:6,padding:14,marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",marginBottom:10,gap:10}}>
                <div style={{fontWeight:700,color:"#1a2e4a",fontSize:13}}>
                  {pendingName?<>Select block for: <span style={{background:"#1a2e4a",color:"#fff",borderRadius:4,padding:"2px 8px",fontSize:12}}>{pendingName}</span></>:"Select block to add:"}
                </div>
                {pendingName&&<button onClick={()=>setPickerState({step:"name"})} style={{...S.ghost,fontSize:11,marginLeft:"auto"}}>← Back</button>}
                <button onClick={()=>{setPickerState(null);setPendingName("");}} style={{...S.ghost,fontSize:11,marginLeft:pendingName?"0":"auto"}}>Cancel</button>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                {["All",...CATS.filter(c=>c!=="Common Field Devices")].map(c=>(
                  <button key={c} onClick={()=>setPickerCat(c)} style={{padding:"3px 10px",borderRadius:4,border:"1px solid #cbd5e1",background:pickerCat===c?"#1a2e4a":"#fff",color:pickerCat===c?"#fff":"#333",cursor:"pointer",fontSize:11}}>{c}</button>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:8}}>
                {pickerBlocks.map(b=>(
                  <div key={b.id} onClick={()=>addBlockRows(b,pendingName||null)}
                    style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:5,padding:"8px 10px",cursor:"pointer"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor="#1a2e4a"}
                    onMouseLeave={e=>e.currentTarget.style.borderColor="#e2e8f0"}>
                    <div style={{fontWeight:600,fontSize:12,color:"#1a2e4a"}}>{b.name}</div>
                    <div style={{fontSize:11,color:"#888",marginTop:2}}>{b.description}</div>
                    <div style={{fontSize:11,color:"#aaa",marginTop:2}}>{b.lines.length} line items</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {estimate.rows.length===0
            ?<div style={{color:"#aaa",textAlign:"center",padding:"24px 0"}}>No lines yet — use the buttons above to start building.</div>
            :(
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <thead><tr style={{background:"#f1f5f9"}}>
                  {["","Qty","Unit","Description","Part No","Code","WkPkg","Rate €","Mkup","Rate Total","Lab €","Lab Total",""].map((h,i)=>(
                    <th key={i} style={{padding:"5px 6px",textAlign:"left",fontWeight:600,color:"#555",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {estimate.rows.map((r,idx)=>{
                    if(r.type==="header")return(
                      <tr key={r.id} style={{background:"#1a2e4a"}}>
                        <td style={{padding:"3px 3px",whiteSpace:"nowrap"}}>
                          <button onClick={()=>moveRow(r.id,-1)} style={{...S.micro,background:"transparent",color:"#ccc",border:"1px solid #456"}}>▲</button>
                          <button onClick={()=>moveRow(r.id,1)} style={{...S.micro,background:"transparent",color:"#ccc",border:"1px solid #456"}}>▼</button>
                        </td>
                        <td colSpan={11} style={{padding:"6px 8px"}}>
                          <input value={r.label} onChange={e=>updRow(r.id,"label",e.target.value)} style={{background:"transparent",border:"none",outline:"none",color:"#fff",fontWeight:700,fontSize:12,width:"100%"}}/>
                        </td>
                        <td><button onClick={()=>removeRow(r.id)} style={{...S.micro,background:"transparent",color:"#f88",border:"1px solid #456"}}>✕</button></td>
                      </tr>
                    );
                    const rt=r.qty*r.rate*(r.markup||1);const lt=r.qty*r.labour;
                    return(
                      <tr key={r.id} style={{borderBottom:"1px solid #f1f5f9",background:idx%2===0?"#fff":"#fafbfc"}}>
                        <td style={{padding:"3px 3px",whiteSpace:"nowrap"}}>
                          <button onClick={()=>moveRow(r.id,-1)} style={S.micro}>▲</button>
                          <button onClick={()=>moveRow(r.id,1)} style={S.micro}>▼</button>
                        </td>
                        <td><input type="number" value={r.qty} onChange={e=>updRow(r.id,"qty",parseFloat(e.target.value)||0)} style={{...S.inp,width:45}}/></td>
                        <td><input value={r.unit} onChange={e=>updRow(r.id,"unit",e.target.value)} style={{...S.inp,width:40}}/></td>
                        <td style={{minWidth:160}}><input value={r.desc} onChange={e=>updRow(r.id,"desc",e.target.value)} style={S.inp}/></td>
                        <td><input value={r.partNo||""} onChange={e=>updRow(r.id,"partNo",e.target.value)} style={{...S.inp,width:80}}/></td>
                        <td><select value={r.code} onChange={e=>updRow(r.id,"code",parseInt(e.target.value))} style={{...S.inp,width:60,fontSize:11}}>
                          {Object.entries(CODES).map(([c,n])=><option key={c} value={c}>{c}</option>)}
                        </select></td>
                        <td><input value={r.workPkg||""} onChange={e=>updRow(r.id,"workPkg",e.target.value)} style={{...S.inp,width:48}}/></td>
                        <td><input type="number" value={r.rate} onChange={e=>updRow(r.id,"rate",parseFloat(e.target.value)||0)} style={{...S.inp,width:65}}/></td>
                        <td><input type="number" step="0.01" value={r.markup||1} onChange={e=>updRow(r.id,"markup",parseFloat(e.target.value)||1)} style={{...S.inp,width:48}}/></td>
                        <td style={{fontWeight:600,whiteSpace:"nowrap",color:"#1a2e4a",padding:"3px 6px"}}>{fmt(rt)}</td>
                        <td><input type="number" value={r.labour} onChange={e=>updRow(r.id,"labour",parseFloat(e.target.value)||0)} style={{...S.inp,width:60}}/></td>
                        <td style={{fontWeight:600,whiteSpace:"nowrap",color:"#4a6741",padding:"3px 6px"}}>{fmt(lt)}</td>
                        <td><button onClick={()=>removeRow(r.id)} style={{...S.micro,color:"#c00"}}>✕</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card title="Notes / Scope / Exclusions">
          <textarea value={estimate.notes} onChange={e=>upd("notes",e.target.value)} rows={3} style={{...S.inp,resize:"vertical"}} placeholder="Scope clarifications, exclusions, assumptions…"/>
        </Card>
        {showExport&&(
          <Card title="📋 CSV Export">
            <div style={{fontSize:11,color:"#555",marginBottom:8}}>Click inside the box to select all, then Ctrl+C. Paste into Notepad and save as .csv, or paste directly into Excel.</div>
            <textarea readOnly value={buildCsv()} rows={16} style={{...S.inp,fontFamily:"monospace",fontSize:11,resize:"vertical",background:"#f8fafc"}} onFocus={e=>e.target.select()}/>
            <button onClick={()=>setShowExport(false)} style={{...S.ghost,marginTop:8}}>Close</button>
          </Card>
        )}
      </div>
      <div style={{width:210,flexShrink:0}}>
        <Card title="Summary">
          <Row label="Rate Total" val={fmt(rateTotal)}/>
          <Row label="Labour Total" val={fmt(labourTotal)} bold={false} color="#4a6741"/>
          <div style={{borderTop:"2px solid #1a2e4a",marginTop:6,paddingTop:6}}>
            <Row label="Grand Total" val={fmt(grandTotal)} bold color="#1a2e4a"/>
          </div>
          <button onClick={()=>setShowExport(p=>!p)} style={{...S.btn(),width:"100%",marginTop:10}}>📋 Export CSV</button>
        </Card>
        {priceList.length===0&&(
          <div style={{background:"#fffbea",border:"1px solid #f0d060",borderRadius:6,padding:10,fontSize:11,color:"#7c4d14"}}>
            💡 Load a Price List CSV using the button in the header to enable live price search.
          </div>
        )}
      </div>
    </div>
  );
}

function Library({blocks,setBlocks}) {
  const [filterCat,setFilterCat]=useState("All");
  const [expanded,setExpanded]=useState(null);
  const [editBlock,setEditBlock]=useState(null);
  const filtered=blocks.filter(b=>filterCat==="All"||b.category===filterCat);
  const saveBlock=b=>{setBlocks(prev=>prev.some(x=>x.id===b.id)?prev.map(x=>x.id===b.id?b:x):[...prev,b]);setEditBlock(null);};
  const deleteBlock=id=>{if(window.confirm("Delete this block?"))setBlocks(b=>b.filter(x=>x.id!==id));};
  const newBlock=()=>setEditBlock({id:uid(),name:"New Block",category:"DDC Controllers",description:"",lines:[]});
  if(editBlock)return <BlockEditor block={editBlock} onSave={saveBlock} onCancel={()=>setEditBlock(null)}/>;
  return(
    <Card title="Block Library">
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        {["All",...CATS].map(c=>(
          <button key={c} onClick={()=>setFilterCat(c)} style={{padding:"3px 12px",borderRadius:4,border:"1px solid #cbd5e1",background:filterCat===c?"#1a2e4a":"#fff",color:filterCat===c?"#fff":"#333",cursor:"pointer",fontSize:12}}>{c}</button>
        ))}
        <button onClick={newBlock} style={{...S.btn("#4a6741"),marginLeft:"auto"}}>+ New Block</button>
      </div>
      {filtered.map(b=>(
        <div key={b.id} style={{border:"1px solid #e2e8f0",borderRadius:6,marginBottom:10,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",padding:"10px 14px",background:"#f8fafc",cursor:"pointer"}} onClick={()=>setExpanded(expanded===b.id?null:b.id)}>
            <div>
              <span style={{fontWeight:700,color:"#1a2e4a"}}>{b.name}</span>
              <span style={{marginLeft:10,fontSize:11,color:"#888"}}>{b.category} · {b.lines.length} line{b.lines.length!==1?"s":""}</span>
              {b.description&&<div style={{fontSize:11,color:"#aaa",marginTop:1}}>{b.description}</div>}
            </div>
            <div style={{marginLeft:"auto",display:"flex",gap:6}}>
              <button onClick={e=>{e.stopPropagation();setEditBlock(b);}} style={S.ghost}>Edit</button>
              <button onClick={e=>{e.stopPropagation();deleteBlock(b.id);}} style={{...S.ghost,color:"#c00"}}>Delete</button>
              <span style={{marginLeft:4,color:"#aaa"}}>{expanded===b.id?"▲":"▼"}</span>
            </div>
          </div>
          {expanded===b.id&&(
            <div style={{overflowX:"auto",padding:"0 4px 8px"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <thead><tr style={{background:"#f1f5f9"}}>
                  {["Qty","Unit","Description","Part No","Code","Rate €","Markup","Labour €"].map((h,i)=><th key={i} style={{padding:"5px 8px",textAlign:"left",fontWeight:600,color:"#555"}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {b.lines.map((l,i)=>(
                    <tr key={l.id} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#fafbfc"}}>
                      <td style={{padding:"4px 8px"}}>{l.qty}</td>
                      <td style={{padding:"4px 8px"}}>{l.unit}</td>
                      <td style={{padding:"4px 8px"}}>{l.desc}</td>
                      <td style={{padding:"4px 8px",color:"#888"}}>{l.partNo}</td>
                      <td style={{padding:"4px 8px"}}><span style={{background:"#e8f0fe",borderRadius:3,padding:"1px 5px",fontSize:10}}>{l.code}</span></td>
                      <td style={{padding:"4px 8px"}}>{fmt(l.rate)}</td>
                      <td style={{padding:"4px 8px",color:"#888"}}>{l.markup||1}x</td>
                      <td style={{padding:"4px 8px",color:"#4a6741"}}>{fmt(l.labour)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </Card>
  );
}

function BlockEditor({block,onSave,onCancel}) {
  const [b,setB]=useState({...block,lines:block.lines.map(l=>({...l}))});
  const updMeta=(k,v)=>setB(x=>({...x,[k]:v}));
  const updLine=(id,k,v)=>setB(x=>({...x,lines:x.lines.map(l=>l.id===id?{...l,[k]:v}:l)}));
  const removeLine=id=>setB(x=>({...x,lines:x.lines.filter(l=>l.id!==id)}));
  const addLine=()=>setB(x=>({...x,lines:[...x.lines,{id:uid(),desc:"",partNo:"",code:415,unit:"No",rate:0,labour:0,qty:1,markup:1,workPkg:"3"}]}));
  const moveLine=(id,dir)=>setB(x=>{
    const arr=[...x.lines];const i=arr.findIndex(l=>l.id===id);const j=i+dir;
    if(j<0||j>=arr.length)return x;[arr[i],arr[j]]=[arr[j],arr[i]];return{...x,lines:arr};
  });
  return(
    <Card title={`Editing: ${b.name}`}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
        <div><Label>Block Name</Label><input value={b.name} onChange={e=>updMeta("name",e.target.value)} style={S.inp}/></div>
        <div><Label>Category</Label><select value={b.category} onChange={e=>updMeta("category",e.target.value)} style={S.inp}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
        <div><Label>Description</Label><input value={b.description} onChange={e=>updMeta("description",e.target.value)} style={S.inp}/></div>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead><tr style={{background:"#f1f5f9"}}>
            {["","Qty","Unit","Description","Part No","Code","WkPkg","Rate €","Markup","Labour €",""].map((h,i)=><th key={i} style={{padding:"5px 6px",textAlign:"left",fontWeight:600,color:"#555"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {b.lines.map((l,idx)=>(
              <tr key={l.id} style={{borderBottom:"1px solid #f1f5f9",background:idx%2===0?"#fff":"#fafbfc"}}>
                <td><button onClick={()=>moveLine(l.id,-1)} style={S.micro}>▲</button><button onClick={()=>moveLine(l.id,1)} style={S.micro}>▼</button></td>
                <td><input type="number" value={l.qty} onChange={e=>updLine(l.id,"qty",parseFloat(e.target.value)||0)} style={{...S.inp,width:45}}/></td>
                <td><input value={l.unit} onChange={e=>updLine(l.id,"unit",e.target.value)} style={{...S.inp,width:40}}/></td>
                <td style={{minWidth:160}}><input value={l.desc} onChange={e=>updLine(l.id,"desc",e.target.value)} style={S.inp}/></td>
                <td><input value={l.partNo||""} onChange={e=>updLine(l.id,"partNo",e.target.value)} style={{...S.inp,width:80}}/></td>
                <td><select value={l.code} onChange={e=>updLine(l.id,"code",parseInt(e.target.value))} style={{...S.inp,width:65,fontSize:11}}>{Object.entries(CODES).map(([c,n])=><option key={c} value={c}>{c} — {n}</option>)}</select></td>
                <td><input value={l.workPkg||""} onChange={e=>updLine(l.id,"workPkg",e.target.value)} style={{...S.inp,width:45}}/></td>
                <td><input type="number" value={l.rate} onChange={e=>updLine(l.id,"rate",parseFloat(e.target.value)||0)} style={{...S.inp,width:65}}/></td>
                <td><input type="number" step="0.01" value={l.markup||1} onChange={e=>updLine(l.id,"markup",parseFloat(e.target.value)||1)} style={{...S.inp,width:50}}/></td>
                <td><input type="number" value={l.labour} onChange={e=>updLine(l.id,"labour",parseFloat(e.target.value)||0)} style={{...S.inp,width:60}}/></td>
                <td><button onClick={()=>removeLine(l.id)} style={{...S.micro,color:"#c00"}}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button onClick={addLine} style={S.btn("#4a6741")}>+ Add Line</button>
        <button onClick={()=>onSave(b)} style={S.btn()}>Save Block</button>
        <button onClick={onCancel} style={S.ghost}>Cancel</button>
      </div>
    </Card>
  );
}

function Card({title,children}){return(<div style={{background:"#fff",borderRadius:8,border:"1px solid #e2e8f0",padding:16,marginBottom:16}}><div style={{fontWeight:700,fontSize:13,color:"#1a2e4a",marginBottom:12,borderBottom:"1px solid #f0f0f0",paddingBottom:8}}>{title}</div>{children}</div>);}
function Label({children}){return <div style={{fontSize:11,color:"#888",marginBottom:3}}>{children}</div>;}
function Row({label,val,bold=true,color="#333"}){return(<div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0",fontSize:12}}><span style={{color:"#555"}}>{label}</span><span style={{fontWeight:bold?700:500,color}}>{val}</span></div>);}
