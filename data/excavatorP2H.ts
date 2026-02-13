import { P2HSection } from '../types';

export const EXCAVATOR_P2H_DATA: P2HSection[] = [
    {
        id: 'mesin',
        title: 'Mesin',
        items: [
            { id: 'oli_mesin', label: 'Oli Mesin', type: 'boolean', required: true },
            { id: 'v_belt', label: 'V-Belt Kipas', type: 'boolean', required: true },
            { id: 'radiator', label: 'Radiator', type: 'boolean', required: true },
            { id: 'hose_radiator', label: 'Hose Radiator', type: 'boolean', required: true },
            { id: 'fungsi_gas', label: 'Fungsi Gas', type: 'boolean', required: true },
            { id: 'tangki_solar', label: 'Tangki Solar', type: 'boolean', required: true },
        ]
    },
    {
        id: 'undercarriage',
        title: 'Under Carriage',
        items: [
            { id: 'shoe', label: 'Shoe', type: 'boolean', required: true },
            { id: 'track_link', label: 'Track Link', type: 'boolean', required: true },
            { id: 'track_tensioner', label: 'Track Tensioner', type: 'boolean', required: true },
            { id: 'idler', label: 'Idler', type: 'boolean', required: true },
            { id: 'upper_roller', label: 'Upper Roller', type: 'boolean', required: true },
            { id: 'lower_roller', label: 'Lower Roller', type: 'boolean', required: true },
            { id: 'motor_travel', label: 'Motor Travel', type: 'boolean', required: true },
            { id: 'reduction_gear', label: 'Reduction Gear Travel', type: 'boolean', required: true },
            { id: 'oil_motor_travel', label: 'Oil Motor Travel', type: 'boolean', required: true },
            { id: 'hose_travel', label: 'Hose Travel', type: 'boolean', required: true },
            { id: 'final_drive_segment', label: 'Final Drive / Segment', type: 'boolean', required: true },
            { id: 'tangga_naik', label: 'Tangga Naik', type: 'boolean', required: true },
        ]
    },
    {
        id: 'attachment',
        title: 'Attachment',
        items: [
            { id: 'boom', label: 'Boom', type: 'boolean', required: true },
            { id: 'bushing_boom', label: 'Bushing Boom', type: 'boolean', required: true },
            { id: 'pin_boom', label: 'Pin Boom', type: 'boolean', required: true },
            { id: 'seal_boom', label: 'Seal Boom', type: 'boolean', required: true },
            { id: 'arm', label: 'Arm', type: 'boolean', required: true },
            { id: 'bushing_arm', label: 'Bushing Arm', type: 'boolean', required: true },
            { id: 'pin_arm', label: 'Pin Arm', type: 'boolean', required: true },
            { id: 'seal_arm', label: 'Seal Arm', type: 'boolean', required: true },
            { id: 'link_bucket', label: 'Link Bucket', type: 'boolean', required: true },
            { id: 'bucket', label: 'Bucket', type: 'boolean', required: true },
            { id: 'teeth_bucket', label: 'Teeth Bucket', type: 'boolean', required: true },
            { id: 'pin_bucket', label: 'Pin Bucket', type: 'boolean', required: true },
            { id: 'bushing_bucket', label: 'Bushing Bucket', type: 'boolean', required: true },
            { id: 'adapter_bucket', label: 'Adapter Bucket', type: 'boolean', required: true },
            { id: 'side_cutter_bucket', label: 'Side Cutter Bucket', type: 'boolean', required: true },
        ]
    },
    {
        id: 'cabin',
        title: 'Cabin',
        items: [
            { id: 'kaca_spion', label: 'Kaca Spion', type: 'boolean', required: true },
            { id: 'kaca_pintu', label: 'Kaca Pintu Kabin', type: 'boolean', required: true },
            { id: 'kaca_depan', label: 'Kaca Depan', type: 'boolean', required: true },
            { id: 'radio', label: 'Radio', type: 'boolean', required: true },
            { id: 'ac', label: 'AC', type: 'boolean', required: true },
            { id: 'karpet_kabin', label: 'Karpet Kabin', type: 'boolean', required: true },
            { id: 'apar', label: 'APAR', type: 'boolean', required: true },
            { id: 'p3k', label: 'Kotak P3K', type: 'boolean', required: true },
            { id: 'seat_belt', label: 'Sabuk Pengaman/Seat belt', type: 'boolean', required: true },
        ]
    },
    {
        id: 'electrical',
        title: 'Electrical',
        items: [
            { id: 'instrumen_panel', label: 'Instrumen Panel', type: 'boolean', required: true },
            { id: 'fuse_box', label: 'Fuse Box', type: 'boolean', required: true },
            { id: 'wiper', label: 'Wiper', type: 'boolean', required: true },
            { id: 'accu', label: 'Accu', type: 'boolean', required: true },
            { id: 'dinamo_starter', label: 'Dinamo Starter', type: 'boolean', required: true },
            { id: 'alternator', label: 'Alternator', type: 'boolean', required: true },
            { id: 'klakson_horm', label: 'Klakson/Horm', type: 'boolean', required: true },
            { id: 'fuse_relay', label: 'Fuse/Relay', type: 'boolean', required: true },
            { id: 'sensor_water_temp', label: 'Sensor Water Temperature', type: 'boolean', required: true },
            { id: 'sensor_oil_press', label: 'Sensor Oil Pressure', type: 'boolean', required: true },
            { id: 'sensor_oil_temp_hyd', label: 'Sensor Oil Temperatur Hidrolic', type: 'boolean', required: true },
            { id: 'controller', label: 'Controller', type: 'boolean', required: true },
            { id: 'sensor_fuel', label: 'Sensor Fuel', type: 'boolean', required: true },
            { id: 'wiring_kabel', label: 'Wiring Kabel', type: 'boolean', required: true },
            { id: 'lampu_lampu', label: 'Lampu-lampu', type: 'boolean', required: true },
            { id: 'motor_engine_stop', label: 'Motor Engine Stop', type: 'boolean', required: true },
            { id: 'motor_rpm', label: 'Motor RPM', type: 'boolean', required: true },
            { id: 'swing_stop', label: 'Swing Stop', type: 'boolean', required: true },
        ]
    },
    {
        id: 'hydraulic',
        title: 'Hydraulic',
        items: [
            { id: 'cilinder_arm', label: 'Cilinder Arm', type: 'boolean', required: true },
            { id: 'hose_arm', label: 'Hose Arm', type: 'boolean', required: true },
            { id: 'cylinder_bucket', label: 'Cylinder Bucket', type: 'boolean', required: true },
            { id: 'hose_bucket', label: 'Hose Bucket', type: 'boolean', required: true },
            { id: 'cylinder_boom', label: 'Cylinder boom', type: 'boolean', required: true },
            { id: 'hose_boom', label: 'Hose Boom', type: 'boolean', required: true },
            { id: 'main_pump', label: 'Main Pump', type: 'boolean', required: true },
            { id: 'control_valve', label: 'Control Valve', type: 'boolean', required: true },
            { id: 'hidrolic_tank', label: 'Hidrolic Tank', type: 'boolean', required: true },
            { id: 'filter_oli_hidrolic', label: 'Filter Oli Hidrolic', type: 'boolean', required: true },
            { id: 'oil_hidrolic', label: 'Oil Hidrolic', type: 'boolean', required: true },
            { id: 'swing_motor', label: 'Swing Motor', type: 'boolean', required: true },
            { id: 'reduction_gear_swing', label: 'Reduction Gear Swing', type: 'boolean', required: true },
            { id: 'oil_swing', label: 'Oil Swing', type: 'boolean', required: true },
            { id: 'hose_swing', label: 'Hose Swing', type: 'boolean', required: true },
            { id: 'hose_hose_control', label: 'Hose-hose Control', type: 'boolean', required: true },
            { id: 'hose_hose_main_pump', label: 'Hose-hose Main Pump', type: 'boolean', required: true },
            { id: 'hose_pilot', label: 'Hose Pilot', type: 'boolean', required: true },
            { id: 'handle', label: 'Handle', type: 'boolean', required: true },
            { id: 'hose_handle', label: 'Hose Handle', type: 'boolean', required: true },
        ]
    },
    {
        id: 'approval',
        title: 'Approval',
        items: [
            { id: 'catatan_umum', label: 'Catatan Umum', type: 'text', required: false },
            { id: 'nama_pengawas', label: 'Nama Pengawas', type: 'text', required: true },
        ]
    }
];
