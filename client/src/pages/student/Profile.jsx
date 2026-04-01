import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import Course from "./Course";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
} from "@/features/api/authApi";
// 1. IMPORT THE PURCHASE QUERY
import { useGetPurchasedCoursesQuery } from "@/features/api/purchaseApi"; 
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { userLoggedIn } from "@/features/authSlice";

const Profile = () => {
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [open, setOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // 2. FETCH REAL ENROLLED COURSES FROM PURCHASE API
  const { 
    data: purchaseData, 
    isLoading: purchaseLoading, 
    refetch: refetchPurchases 
  } = useGetPurchasedCoursesQuery();

  const [
    updateUser,
    {
      data: updateUserData,
      isLoading: updateUserIsLoading,
      isError,
      error,
      isSuccess,
    },
  ] = useUpdateUserMutation();

  // Prefill name when user loads
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (isSuccess && updateUserData?.user) {
      dispatch(userLoggedIn({ user: updateUserData.user }));
      setOpen(false);
      setProfilePhoto(null);
      toast.success(updateUserData.message || "Profile updated");
    }

    if (isError) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  }, [isSuccess, isError, updateUserData, error, dispatch]);

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhoto(file);
  };

  const updateUserHandler = async () => {
    const formData = new FormData();
    formData.append("name", name);
    if (profilePhoto) {
      formData.append("profilePhoto", profilePhoto);
    }
    await updateUser(formData);
  };

  // 3. DEFINE THE SOURCE OF TRUTH FOR ENROLLED COURSES
  const enrolledCourses = purchaseData?.purchasedCourse || [];

  if (!user) return <h1 className="p-10 text-center">Loading user data...</h1>;

  return (
    <div className="max-w-4xl mx-auto px-4 my-10">
      <h1 className="font-bold text-2xl text-center md:text-left">PROFILE</h1>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 my-5">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 mb-4">
            <AvatarImage
              src={user?.photoUrl || "https://github.com/shadcn.png"}
              alt="profile"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>

        <div>
          <div className="mb-2">
            <h1 className="font-semibold">
              Name: <span className="font-normal ml-2">{user?.name}</span>
            </h1>
          </div>
          <div className="mb-2">
            <h1 className="font-semibold">
              Email: <span className="font-normal ml-2">{user?.email}</span>
            </h1>
          </div>
          <div className="mb-2">
            <h1 className="font-semibold">
              Role: <span className="font-normal ml-2">{user?.role?.toUpperCase()}</span>
            </h1>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="mt-2">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>Make changes to your profile here.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Profile Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={onChangeHandler}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button disabled={updateUserIsLoading} onClick={updateUserHandler}>
                  {updateUserIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                    </>
                  ) : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-10">
        <h1 className="font-bold text-xl mb-5">Courses you're enrolled in</h1>
        {purchaseLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {enrolledCourses.length === 0 ? (
                <div className="col-span-full py-10 text-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-gray-500 italic">You haven't enrolled in any courses yet.</p>
                </div>
              ) : (
                enrolledCourses.map((course) => (
                  <Course course={course} key={course._id} isMyLearning={true} />
                ))
              )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Profile;