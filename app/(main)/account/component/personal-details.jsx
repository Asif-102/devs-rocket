"use client";

import { updateUserInfo } from "@/app/actions/account";
import { ButtonLoading } from "@/components/button-loading";
import { useState } from "react";

const { Button } = require("@/components/ui/button");
const { Input } = require("@/components/ui/input");
const { Label } = require("@/components/ui/label");
const { Textarea } = require("@/components/ui/textarea");

export default function PersonalDetails({ userInfo }) {
  const [infoState, setInfoState] = useState({
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
    email: userInfo.email,
    designation: userInfo.designation ?? "",
    bio: userInfo.bio ?? "",
  });

  const [loader, setLoader] = useState(false);

  const handleChange = (event) => {
    const field = event.target.name;
    const value = event.target.value;

    setInfoState({
      ...infoState,
      [field]: value,
    });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    // console.log("🚀 ~ PersonalDetails ~ infoState:", infoState);
    setLoader(true);

    try {
      await updateUserInfo(userInfo?.email, infoState);
    } catch (error) {
      console.error(error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="p-6 rounded-md shadow dark:shadow-gray-800 bg-white dark:bg-slate-900">
      <h5 className="text-lg font-semibold mb-4">Personal Detail :</h5>
      <form onSubmit={handleUpdate}>
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
          <div>
            <Label className="mb-2 block">
              First Name : <span className="text-red-600">*</span>
            </Label>
            <Input
              type="text"
              placeholder="First Name:"
              id="firstName"
              name="firstName"
              value={infoState.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label className="mb-2 block">
              Last Name : <span className="text-red-600">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Last Name:"
              name="lastName"
              value={infoState?.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label className="mb-2 block">
              Your Email : <span className="text-red-600">*</span>
            </Label>
            <Input
              type="email"
              placeholder="Email"
              name="email"
              value={infoState?.email}
              disabled
            />
          </div>
          <div>
            <Label className="mb-2 block">Occupation :</Label>
            <Input
              name="designation"
              id="occupation"
              value={infoState?.designation}
              type="text"
              onChange={handleChange}
              placeholder="Occupation :"
            />
          </div>
        </div>
        {/*end grid*/}
        <div className="grid grid-cols-1">
          <div className="mt-5">
            <Label className="mb-2 block">Bio :</Label>
            <Textarea
              id="bui"
              name="bio"
              value={infoState?.bio}
              placeholder="Enter your Bio"
              onChange={handleChange}
            />
          </div>
        </div>
        {/*end row*/}
        {loader ? (
          <div className="mt-5">
            <ButtonLoading />
          </div>
        ) : (
          <Button className="mt-5 cursor-pointer" asChild>
            <input type="submit" name="send" value="Save Changes" />
          </Button>
        )}
      </form>
      {/*end form*/}
    </div>
  );
}
