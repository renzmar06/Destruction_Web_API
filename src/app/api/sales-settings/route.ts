import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import SalesSettings from "@/models/SalesSettings";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User authentication required",
        },
        { status: 401 },
      );
    }

    const salesSettings = await SalesSettings.findOne({ user_id: userId });

    return NextResponse.json(
      {
        success: true,
        data: salesSettings,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching sales settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch sales settings",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const data = await request.json();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User authentication required",
        },
        { status: 401 },
      );
    }

    const salesSettingsData = {
      ...data,
      user_id: userId,
    };

    const result = await SalesSettings.findOneAndUpdate(
      { user_id: userId },
      salesSettingsData,
      { upsert: true, new: true },
    );

    return NextResponse.json(
      {
        success: true,
        message: "Sales settings saved successfully",
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error saving sales settings:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save sales settings",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
