import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const COOKIE_NAME = "auth_violations";

/* ─── cookie helpers ─── */
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[2]));
    } catch {
      return {};
    }
  }
  return {};
}

function setCookie(name, value, minutes = 30) {
  const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    JSON.stringify(value),
  )}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function getStrikes(userId) {
  if (!userId) return 0;
  const data = getCookie(COOKIE_NAME);
  const timestamps = data[userId]?.timestamps || [];
  const now = Date.now();
  return timestamps.filter((t) => now - t < 30 * 60 * 1000).length;
}

function addStrike(userId) {
  const data = getCookie(COOKIE_NAME);
  const timestamps = data[userId]?.timestamps || [];
  timestamps.push(Date.now());
  data[userId] = { timestamps };
  setCookie(COOKIE_NAME, data, 30);
  return timestamps.length;
}

function clearStrikes(userId) {
  const data = getCookie(COOKIE_NAME);
  delete data[userId];
  if (Object.keys(data).length === 0) {
    deleteCookie(COOKIE_NAME);
  } else {
    setCookie(COOKIE_NAME, data, 30);
  }
}

/* ─── component ─── */
export default function SecurityRedirect({ to, userId, logout }) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  // Initialize once: read current strikes, add one, store in React state
  const [strikes, setStrikes] = useState(() => {
    const current = getStrikes(userId);
    if (current >= 2) {
      // 3rd strike — mark it so useEffect handles logout
      return 3;
    }
    return addStrike(userId);
  });

  // 3rd strike → logout immediately (no modal)
  useEffect(() => {
    if (strikes >= 3) {
      clearStrikes(userId);
      logout();
    }
  }, [strikes, userId, logout]);

  // Countdown timer for 1st & 2nd strikes
  useEffect(() => {
    if (strikes >= 3) return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          navigate(to, { replace: true });
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [to, navigate, strikes]);

  // Don't render anything if we're logging out
  if (strikes >= 3) return null;

  const isFinalWarning = strikes === 2;
  const remaining = 3 - strikes;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`mx-4 w-full max-w-md rounded-xl border-l-4 p-6 shadow-2xl ${
          isFinalWarning
            ? "border-red-500 bg-red-50"
            : "border-amber-500 bg-amber-50"
        }`}
      >
        <div className="flex items-start gap-4">
          <span className="text-3xl">{isFinalWarning ? "🚫" : "⚠️"}</span>
          <div className="flex-1">
            <h3
              className={`text-lg font-bold ${
                isFinalWarning ? "text-red-800" : "text-amber-800"
              }`}
            >
              {isFinalWarning ? "Final Warning" : "Access Restricted"}
            </h3>
            <p
              className={`mt-2 text-sm leading-relaxed ${
                isFinalWarning ? "text-red-700" : "text-amber-700"
              }`}
            >
              You are trying to access a portal that does not belong to your
              role. This is attempt {strikes} of 3. After {remaining} more
              violation{remaining === 1 ? "" : "s"}, you will be logged out
              automatically.
            </p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Redirecting in {countdown}s…
              </span>
              <button
                onClick={() => navigate(to, { replace: true })}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white ${
                  isFinalWarning
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                Go Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
