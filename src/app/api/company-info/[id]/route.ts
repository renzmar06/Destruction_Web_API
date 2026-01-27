import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import CompanyInfo from "@/models/CompanyInfo";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const data = await request.json();
    const { id } = await params;

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
    };

    const result = await CompanyInfo.findOneAndUpdate(
      { _id: id, user_id: userId },
      companyData,
      { new: true },
    );

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message: "Company info not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Company info updated successfully",
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating company info:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update company info",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const { id } = await params;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User authentication required",
        },
        { status: 401 },
      );
    }

    const result = await CompanyInfo.findOneAndDelete({
      _id: id,
      user_id: userId,
    });

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message: "Company info not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Company info deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting company info:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete company info",
      },
      { status: 500 },
    );
  }
}
