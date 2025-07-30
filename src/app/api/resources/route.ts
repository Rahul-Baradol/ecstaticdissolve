import { NextRequest, NextResponse } from "next/server";
import { addResource, getReviewers } from "@/lib/db";
import { resourceSchema } from "@/lib/schema";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = resourceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const email = req.headers.get("userid");
  if (!email) {
    return NextResponse.json(
      { error: "Missing email in session token" },
      { status: 400 }
    );
  }

  try {
    const resource =await addResource({
      ...parsed.data,
      authorEmail: email,
    });

    // send a review email to the reviewers , by fetching the emails of reviewers from the database
    const reviewers = await getReviewers();
    const resourceId = resource.id;
    console.log("Reviewers to notify:", reviewers);
    

    await Promise.all(
      reviewers.map(async (reviewerEmail) => {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/reviewResource/sendReviewReq`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: reviewerEmail,
                data: parsed.data,
                resourceId: resourceId,
              }),
            }
          );
          if (!response.ok) {
            console.error(
              `Failed to notify reviewer ${reviewerEmail}: ${response.statusText}`
            );
          }
      })
    );
   
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to add resource." },
      { status: 500 }
    );
  }
}
