import { Category } from "@/model/category-model";
import { Course } from "@/model/course-model";
import { Module } from "@/model/module-model";
import { Testimonial } from "@/model/testimonial-model";
import { User } from "@/model/user-model";

import {
  replaceMongoIdInArray,
  replaceMongoIdInObject,
} from "@/lib/convertData";
import { groupBy } from "@/lib/customFunction";
import { Lesson } from "@/model/lesson-model";
import { Quizset } from "@/model/quizset-model";
import { Quiz } from "@/model/quizzes-model";
import dbConnect from "@/service/mongo";
import { getEnrollmentsForCourse } from "./enrollments";
import { getTestimonialsForCourse } from "./testimonials";

import { unstable_cache } from "next/cache";

export const getCourseList = unstable_cache(
  async (filter = {}) => {
    await dbConnect();

    filter["active"] = true;

    const courses = await Course.find(filter)
      .select([
        "title",
        "subtitle",
        "thumbnail",
        "modules",
        "price",
        "category",
        "instructor",
      ])
      .populate({
        path: "category",
        model: Category,
      })
      .populate({
        path: "instructor",
        model: User,
      })
      .populate({
        path: "testimonials",
        model: Testimonial,
      })
      .populate({
        path: "modules",
        model: Module,
      })
      .lean();
    return replaceMongoIdInArray(courses);
  },
  ["courses"],
  { tags: ["courses"] }
);

export async function getCourseDetails(id) {
  await dbConnect();

  const course = await Course.findById(id)
    .populate({
      path: "category",
      model: Category,
    })
    .populate({
      path: "instructor",
      model: User,
    })
    .populate({
      path: "testimonials",
      model: Testimonial,
      populate: {
        path: "user",
        model: User,
      },
    })
    .populate({
      path: "modules",
      model: Module,
      populate: {
        path: "lessonIds",
        model: Lesson,
      },
    })
    .populate({
      path: "quizSet",
      model: Quizset,
      populate: {
        path: "quizIds",
        model: Quiz,
      },
    })
    .lean();

  return replaceMongoIdInObject(course);
}

export async function getCourseDetailsByInstructor(instructorId, expand) {
  await dbConnect();

  const publishedCourses = await Course.find({
    instructor: instructorId,
    active: true,
  }).lean();

  const enrollments = await Promise.all(
    publishedCourses.map(async (course) => {
      const enrollment = await getEnrollmentsForCourse(course._id.toString());
      return enrollment;
    })
  );

  const groupedByCourses = groupBy(enrollments.flat(), ({ course }) => course);

  const totalRevenue = publishedCourses.reduce((acc, course) => {
    const quantity = groupedByCourses[course._id]
      ? groupedByCourses[course._id].length
      : 0;
    return acc + quantity * course.price;
  }, 0);

  const totalEnrollments = enrollments.reduce(function (acc, obj) {
    return acc + obj.length;
  }, 0);

  const testimonials = await Promise.all(
    publishedCourses.map(async (course) => {
      const testimonial = await getTestimonialsForCourse(course._id.toString());
      return testimonial;
    })
  );

  const totalTestimonials = testimonials.flat();
  let avgRating =
    totalTestimonials.reduce(function (acc, obj) {
      return acc + obj.rating;
    }, 0) / totalTestimonials.length;

  // If avgRating is NaN, assign 0
  avgRating = isNaN(avgRating) ? 0 : avgRating;

  //console.log("testimonials", totalTestimonials, avgRating);
  if (expand) {
    const allCourses = await Course.find({ instructor: instructorId }).lean();
    return {
      courses: allCourses?.flat(),
      enrollments: enrollments?.flat(),
      reviews: totalTestimonials,
    };
  }
  return {
    courses: publishedCourses.length,
    enrollments: totalEnrollments,
    reviews: totalTestimonials.length,
    ratings: avgRating.toPrecision(2),
    revenue: totalRevenue,
  };
}

export async function create(courseData) {
  try {
    await dbConnect();

    const course = await Course.create(courseData);
    return JSON.parse(JSON.stringify(course));
  } catch (err) {
    throw new Error(err);
  }
}
