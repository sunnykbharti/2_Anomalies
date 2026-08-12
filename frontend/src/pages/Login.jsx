import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../api/Api";

const Login = () => {
  const [showOtp, setShowOtp] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  // Send mobile number
  const handleMobileSubmit = async (data) => {
    try {
      const response = await api.post("/login", {
        mobile: data.mobile,
      });

      console.log(response.data);

      setShowOtp(true);

      alert("OTP sent successfully");
    } catch (error) {
      console.error("OTP sending failed:", error);

      alert(
        error.response?.data?.message ||
          "Failed to send OTP"
      );
    }
  };

  // Verify OTP
  const handleOtpSubmit = async (data) => {
    try {
      const response = await api.post("/login", {
        mobile: getValues("mobile"),
        otp: data.otp,
      });

      console.log(response.data);

      const token = response.data.access_token;

      localStorage.setItem("token", token);

      alert("Login successful!");

      navigate("/dashboard");
    } catch (error) {
      console.error("OTP verification failed:", error);

      alert(
        error.response?.data?.message ||
          "Invalid OTP"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold text-gray-800">
            Nirmaya
          </h1>

          <p className="text-gray-500 mt-2">
            Login to access your health center
          </p>

        </div>

        {!showOtp ? (

          /* MOBILE FORM */
          <form onSubmit={handleSubmit(handleMobileSubmit)}>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>

            <div className="flex">

              <span className="flex items-center px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">
                +91
              </span>

              <input
                type="tel"
                placeholder="Enter mobile number"
                {...register("mobile", {
                  required: "Mobile number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message:
                      "Enter a valid 10-digit mobile number",
                  },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-r-lg outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {errors.mobile && (
              <p className="text-red-500 text-sm mt-2">
                {errors.mobile.message}
              </p>
            )}

            <button
              type="submit"
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Send OTP
            </button>

          </form>

        ) : (

          /* OTP FORM */
          <form onSubmit={handleSubmit(handleOtpSubmit)}>

            <div className="text-center mb-6">

              <p className="text-gray-600">
                OTP sent to
              </p>

              <p className="font-semibold text-gray-800">
                +91 {getValues("mobile")}
              </p>

            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              {...register("otp", {
                required: "OTP is required",
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: "OTP must be 6 digits",
                },
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center tracking-[0.5em] text-xl outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.otp && (
              <p className="text-red-500 text-sm mt-2">
                {errors.otp.message}
              </p>
            )}

            <button
              type="submit"
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              Verify OTP
            </button>

            <button
              type="button"
              onClick={() => setShowOtp(false)}
              className="w-full mt-3 text-blue-600"
            >
              Change Mobile Number
            </button>

          </form>

        )}

      </div>
    </div>
  );
};

export default Login;