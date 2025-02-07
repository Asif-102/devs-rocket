"use server";

import { getSlug, replaceMongoIdInArray } from "@/lib/convertData";
import { getLoggedInUser } from "@/lib/loggedin-user";
import { TransformedQuizData } from "@/lib/quiz-helper";
import { Assessment } from "@/model/assessment-model";
import { Quizset } from "@/model/quizset-model";
import { Quiz } from "@/model/quizzes-model";
import { createQuiz, getQuizSetById } from "@/queries/quizzes";
import { createAssessmentReport } from "@/queries/reports";
import dbConnect from "@/service/mongo";
import mongoose from "mongoose";

export async function updateQuizSet(quizset, dataToUpdate) {
  try {
    await dbConnect();

    await Quizset.findByIdAndUpdate(quizset, dataToUpdate);
  } catch (e) {
    throw new Error(e);
  }
}

export async function addQuizToQuizSet(quizSetId, quizData) {
  try {
    console.log(quizSetId, quizData);

    const transformedQuizData = TransformedQuizData(quizData);

    console.log(transformedQuizData);
    const createdQuizId = await createQuiz(transformedQuizData);
    console.log(createdQuizId);

    await dbConnect();

    const quizSet = await Quizset.findById(quizSetId);
    quizSet.quizIds.push(createdQuizId);
    quizSet.save();
  } catch (e) {
    throw new Error(e);
  }
}

export async function doCreateQuizSet(data) {
  try {
    data["slug"] = getSlug(data.tite);

    await dbConnect();

    const craetedQuizSet = await Quizset.create(data);
    return craetedQuizSet?._id.toString();
  } catch (e) {
    throw new Error(e);
  }
}

export async function deleteQuiz(quizId, quizSetId) {
  try {
    await dbConnect();

    const quizSet = await Quizset.findById(quizSetId);
    quizSet.quizIds.pull(new mongoose.Types.ObjectId(quizId));
    await Quiz.findByIdAndDelete(quizId);
    quizSet.save();
  } catch (e) {
    throw new Error(e);
  }
}

export async function updateQuiz(quizId, dataToUpdate) {
  try {
    const transformedQuizData = TransformedQuizData(dataToUpdate);

    await dbConnect();

    await Quiz.findByIdAndUpdate(quizId, transformedQuizData);
  } catch (e) {
    throw new Error(e);
  }
}

export async function changeQuizSetPublishState(quizSetId) {
  try {
    await dbConnect();

    const quizSet = await Quizset.findById(quizSetId);
    const res = await Quizset.findByIdAndUpdate(
      quizSetId,
      { active: !quizSet.active },
      { lean: true }
    );
    return res.active;
  } catch (err) {
    throw new Error(err);
  }
}

export async function deleteQuizSetWithQuizzes(quizSetId) {
  try {
    await dbConnect();

    const quizSet = await Quizset.findById(quizSetId);
    if (!quizSet) {
      throw new Error("Quizset not found");
    }

    await Quiz.deleteMany({ _id: { $in: quizSet.quizIds } });

    await Quizset.findByIdAndDelete(quizSetId);
  } catch (err) {
    throw new Error(err);
  }
}

export async function addQuizAssessment(courseId, quizSetId, answers) {
  try {
    console.log(quizSetId, answers);
    const quizSet = await getQuizSetById(quizSetId);
    const quizzes = replaceMongoIdInArray(quizSet.quizIds);

    const assessmentRecord = quizzes.map((quiz) => {
      const obj = {};
      obj.quizId = new mongoose.Types.ObjectId(quiz.id);
      const found = answers.find((a) => a.quizId === quiz.id);
      if (found) {
        obj.attmpted = true;
      } else {
        obj.attmpted = false;
      }
      const mergedOptions = quiz.options.map((o) => {
        return {
          option: o.text,
          isCorrect: o.is_correct,
          isSelected: (function () {
            const found = answers.find((a) => a.options[0].option === o.text);
            if (found) {
              return true;
            } else {
              return false;
            }
          })(),
        };
      });
      obj["options"] = mergedOptions;
      return obj;
    });

    const assessmentEntry = {};
    assessmentEntry.assessments = assessmentRecord;
    assessmentEntry.otherMarks = 0;

    await dbConnect();

    const assessment = await Assessment.create(assessmentEntry);
    const loggedInUser = await getLoggedInUser();

    await createAssessmentReport({
      courseId: courseId,
      userId: loggedInUser.id,
      quizAssessment: assessment?._id,
    });
  } catch (err) {
    throw new Error(err);
  }
}
