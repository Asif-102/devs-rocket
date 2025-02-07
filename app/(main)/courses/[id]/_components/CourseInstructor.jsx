import {
  ArrowRight,
  MessageSquare,
  Presentation,
  Star,
  UsersRound,
} from "lucide-react";

import { getCourseDetailsByInstructor } from "@/queries/courses";
import Image from "next/image";
import Link from "next/link";

const CourseInstructor = async ({ course }) => {
  // console.log("🚀 ~ CourseInstructor ~ course:", course);
  const instructor = course?.instructor;

  const fullName = `${instructor?.firstName}  ${instructor?.lastName}`;
  const courseDetailsByInstructor = await getCourseDetailsByInstructor(
    instructor._id.toString()
  );

  // console.log(courseDetailsByInstructor);

  return (
    <div className=" rounded-md p-8">
      <div className="md:flex md:gap-x-5 mb-8">
        <div className="h-[310px] w-[270px] max-w-full  flex-none rounded mb-5 md:mb-0">
          <Image
            src={instructor?.profilePicture ?? "https://i.pravatar.cc"}
            alt={fullName}
            className="w-full h-full object-cover rounded"
            width={500}
            height={700}
          />
        </div>
        <div className="flex-1">
          <div className="max-w-[300px]">
            <h4 className="text-[34px] font-bold leading-[51px]">{fullName}</h4>
            <div className="text-gray-600 font-medium mb-6">
              {instructor?.designation}
            </div>
            <ul className="list space-y-4">
              <li className="flex items-center space-x-3">
                <Presentation className="text-gray-600" />
                <div>{courseDetailsByInstructor?.courses} Course(s)</div>
              </li>
              <li className="flex space-x-3">
                <UsersRound className="text-gray-600" />
                <div>
                  {courseDetailsByInstructor?.enrollments} Student Learned
                </div>
              </li>
              <li className="flex space-x-3">
                <MessageSquare className="text-gray-600" />
                <div>{courseDetailsByInstructor?.reviews} Reviews</div>
              </li>
              <li className="flex space-x-3">
                <Star className="text-gray-600" />
                <div>{courseDetailsByInstructor?.ratings} Average Rating</div>
              </li>
              <li className="flex space-x-3">
                <Link
                  href={`/inst-profile/${course?.id}`}
                  variant="ghost"
                  className="text-xs text-sky-700 h-7 gap-1 flex items-center"
                >
                  See Profile
                  <ArrowRight className="w-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p className="text-gray-600">{instructor?.bio}</p>
    </div>
  );
};

export default CourseInstructor;
