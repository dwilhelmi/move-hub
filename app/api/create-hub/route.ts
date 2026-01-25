import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, userId } = await request.json()

    if (!name || !userId) {
      return NextResponse.json(
        { error: "Name and userId are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify the authenticated user matches the userId
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create the hub (trigger automatically adds creator as owner)
    const { data: newHub, error: hubError } = await supabase
      .from("hubs")
      .insert({ name, created_by: userId })
      .select()
      .single()

    if (hubError) {
      console.error("Error creating hub:", hubError)
      return NextResponse.json(
        { error: "Failed to create hub" },
        { status: 500 }
      )
    }

    return NextResponse.json(newHub)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
