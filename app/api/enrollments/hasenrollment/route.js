import { hasEnrollmentForCourse } from "@/queries/enrollments";
import { getUserByEmail } from "@/queries/users";

import { NextResponse } from "next/server";

export const POST = async (request) => {
  const { courseId, email } = await request.json();

  try {
    const user = await getUserByEmail(email);

    const hasEnrollment = await hasEnrollmentForCourse(courseId, user?.id);

    return new NextResponse(hasEnrollment, {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(error.message, {
      status: 500,
    });
  }
};
