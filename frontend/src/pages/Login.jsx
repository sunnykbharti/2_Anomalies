import { useState } from "react";
import api from "../api/Api"

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const handleMobileSubmit = async (e) => {
    e.preventDefault();

    if (mobile.length !== 10) {
      alert("Enter a valid 10-digit mobile number");
      return;
    }

    try {
      const response = await api.post(
        "/login",
        {
          mobile: mobile,
        }
      );

      console.log(response.data);

      setShowOtp(true);

    } catch (error) {
      console.error("OTP sending failed:", error);

      alert(
        error.response?.data?.message ||
        "Failed to send OTP"
      );
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      alert("Enter a valid 6-digit OTP");
      return;
    }

    try {
      const response = await api.post(
        "/login",
        {
          mobile: mobile,
          otp: otp,
        }
      );

      console.log(response.data);

      alert("Login successful!");

      // If Flask returns a JWT token:
      // localStorage.setItem("token", response.data.access_token);

      // navigate("/dashboard");

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
            Village Health
          </h1>

          <p className="text-gray-500 mt-2">
            Login to access your health center
          </p>

        </div>


        {!showOtp ? (

          /* Mobile Number */
          <form onSubmit={handleMobileSubmit}>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>

            <div className="flex">

              <span className="flex items-center px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">
                +91
              </span>

              <input
                type="tel"
                value={mobile}
                onChange={(e) =>
                  setMobile(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10)
                  )
                }
                placeholder="Enter mobile number"
                className="w-full px-4 py-3 border border-gray-300 rounded-r-lg outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>


            <button
              type="submit"
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Send OTP
            </button>

          </form>

        ) : (

          /* OTP */
          <form onSubmit={handleOtpSubmit}>

            <div className="text-center mb-6">

              <p className="text-gray-600">
                OTP sent to
              </p>

              <p className="font-semibold text-gray-800">
                +91 {mobile}
              </p>

            </div>


            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>


            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              placeholder="Enter 6-digit OTP"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center tracking-[0.5em] text-xl outline-none focus:ring-2 focus:ring-blue-500"
            />


            <button
              type="submit"
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Verify OTP
            </button>


            <button
              type="button"
              onClick={() => {
                setShowOtp(false);
                setOtp("");
              }}
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