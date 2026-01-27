import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  material_type: {
    type: String,
    enum: ['alcoholic_beverages', 'non_alcoholic_beverages', 'food_products', 'pharmaceuticals', 'consumer_goods', 'packaging_materials', 'hazardous_materials', 'other'],
    required: true
  },
  packaging_type: {
    type: String,
    enum: ['aluminum_cans', 'plastic_bottles', 'glass_bottles', 'tetra_pak', 'kegs', 'drums', 'pallets', 'bulk', 'mixed_packaging', 'other'],
    required: true
  },
  quantity: { type: Number, required: true },
  unit_of_measure: {
    type: String,
    enum: ['cases', 'pallets', 'pounds', 'kilograms', 'gallons', 'liters', 'units', 'tons'],
    required: true
  },
  container_type: { type: String },
  final_disposition: {
    type: String,
    enum: ['landfill', 'recycling', 'composting', 'incineration', 'waste_to_energy', 'reprocessing', 'scrap_metal', 'other'],
    required: true
  },
  description: { type: String },
  sort_order: { type: Number, default: 0 }
});

const jobSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job_id: { type: String, required: true, unique: true },
  job_name: { type: String, required: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer_name: { type: String, required: true },
  estimate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Estimate', required: true },
  estimate_number: { type: String, required: true },
  job_location_id: { type: String },
  scheduled_date: { type: Date },
  actual_start_date: { type: Date },
  actual_completion_date: { type: Date },
  destruction_method: { 
    type: String, 
    enum: ['mechanical_destruction', 'chemical_destruction', 'incineration', 'shredding', 'liquidization', 'other'],
    default: 'mechanical_destruction'
  },
  destruction_description: { type: String },
  requires_affidavit: { type: Boolean, default: false },
  special_handling_notes: { type: String },
  materials: [materialSchema],
  job_status: { 
    type: String, 
    enum: ['scheduled', 'in_progress', 'completed', 'archived'],
    default: 'scheduled'
  },
}, {
  timestamps: true
});

export default mongoose.models.Job || mongoose.model('Job', jobSchema);