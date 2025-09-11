import mongoose, { Schema, Document } from "mongoose";

export interface IModel extends Document {
  name: string;
  description: string;
  status: 'active' | 'inactive';
  type: string;
  config: {
    temperature: number;
    min_p: number;
    max_tokens: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ModelSchema = new Schema<IModel>({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'inactive' 
  },
  type: { 
    type: String, 
    required: true 
  },
  config: {
    temperature: { 
      type: Number, 
      default: 0.7 
    },
    min_p: { 
      type: Number, 
      default: 0.05 
    },
    max_tokens: { 
      type: Number, 
      default: 2048 
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt timestamp on save
ModelSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Model = mongoose.models.Model || mongoose.model<IModel>("Model", ModelSchema);
export default Model;