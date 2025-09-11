import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { connectDB } from '@/lib/mongodb';
import ChatLog from '@/app/api/admin/models/ChatLog';
import User from '@/app/api/admin/models/User';
import Model from '@/app/api/admin/models/Model';

export async function GET(req: NextRequest) {
  try {
    console.log('Starting stats API request...');
    
    // Check admin authorization
    try {
      const redirect = await requireAdmin(req);
      if (redirect) {
        console.log('Admin authorization failed');
        return redirect;
      }
      console.log('Admin authorization successful');
    } catch (authError) {
      console.error('Error in admin authorization:', authError);
      return NextResponse.json({ error: 'Authorization failed' }, { status: 401 });
    }

    // Connect to MongoDB
    try {
      await connectDB();
      console.log('MongoDB connected successfully');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Fetch all statistics in parallel with error handling
    try {
      const [users, chats, models] = await Promise.all([
        User.find({}).lean().exec(),
        ChatLog.find({}).lean().exec(),
        Model.find({ status: 'active' }).lean().exec()
      ]);

      console.log('Statistics retrieved:');
      console.log('- Users count:', users.length);
      console.log('- Chats count:', chats.length);
      console.log('- Active models count:', models.length);

      const stats = {
        totalUsers: users.length,
        totalChats: chats.length,
        activeModels: models.length,
        timestamp: new Date().toISOString()
      };

      console.log('Sending stats response:', stats);
      
      return NextResponse.json(stats, {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Content-Type': 'application/json'
        }
      });
    } catch (fetchError) {
      console.error('Error fetching statistics:', fetchError);
      return NextResponse.json({ 
        error: 'Failed to fetch statistics',
        details: fetchError instanceof Error ? fetchError.message : 'Unknown error'
      }, { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Unhandled error in stats API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  }
}