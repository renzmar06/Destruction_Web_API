import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import CompanyInfo from "@/models/CompanyInfo";
import User from "@/models/User";

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

    const companyInfo = await CompanyInfo.findOne({ user_id: userId });

    return NextResponse.json({
      success: true,
      data: companyInfo,
    });
  } catch (error) {
    console.error("Error fetching company info:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch company info",
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

    const companyData = {
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      email: data.email,
      phone: data.phone,
      website: data.website,
      ein_ssn: data.ein_ssn,
      company_logo_url: data.company_logo_url,
      user_id: userId,
    };

    const result = await CompanyInfo.findOneAndUpdate(
      { user_id: userId },
      companyData,
      { upsert: true, new: true },
    );

    // Also update the User model's logo_url field
    if (data.company_logo_url) {
      await User.findByIdAndUpdate(userId, {
        logo_url: data.company_logo_url
      });
    }

    return NextResponse.json({
      success: true,
      message: "Company info saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error saving company info:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save company info",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
