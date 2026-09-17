import React, { useEffect, useState } from "react";
import { Share, PlusSquare, X } from "lucide-react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "welama-a2hs-dismissed";
const HIDDEN = ["/auth", "/admin", "/checkout"];

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true);

const isIos = () =>
  typeof navigator !== "undefined" &&
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !window.MSStream;

const AddToHomeScreen = () => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [installEvent, setInstallEvent] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (isStandalone()) return undefined;
    if (localStorage.getItem(STORAGE_KEY) === "1") return undefined;
    if (!window.matchMedia("(max-width: 767px)").matches) return undefined;

    const onPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const timer = window.setTimeout(() => setVisible(true), 1800);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.clearTimeout(timer);
    };
  }, []);

  if (HIDDEN.some((path) => pathname.startsWith(path)) || !visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    setShowIosHelp(false);
  };

  const handleAdd = async () => {
    if (installEvent) {
      installEvent.prompt();
      const choice = await installEvent.userChoice;
      setInstallEvent(null);
      if (choice?.outcome === "accepted") dismiss();
      return;
    }
    setShowIosHelp(true);
  };

  return (
    <>
      <div className="a2hs-card" role="dialog" aria-label="Add WELAMA to Home Screen">
        <img src="/icons/icon-192.png" alt="" className="a2hs-icon" />
        <div className="a2hs-copy">
          <strong>Add WELAMA to Home Screen</strong>
          <span>Open it like an app. The WELAMA logo is the icon.</span>
        </div>
        <button type="button" className="a2hs-add" onClick={handleAdd}>
          Add
        </button>
        <button type="button" className="a2hs-close" onClick={dismiss} aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>

      {showIosHelp && (
        <div className="a2hs-help" role="dialog" aria-modal="true">
          <div className="a2hs-help-sheet">
            <button type="button" className="a2hs-close a2hs-help-x" onClick={() => setShowIosHelp(false)} aria-label="Close">
              <X size={18} />
            </button>
            <img src="/icons/apple-touch-icon.png" alt="WELAMA" className="a2hs-help-logo" />
            <h3>Add to Home Screen</h3>
            <p>
              {isIos()
                ? "Safari can save WELAMA on your phone like an app, with this logo as the icon."
                : "Your browser can save WELAMA on your phone like an app, with this logo as the icon."}
            </p>
            <ol>
              <li>
                Tap <Share size={14} /> Share
              </li>
              <li>
                Tap <PlusSquare size={14} /> Add to Home Screen
              </li>
              <li>Tap Add — look for the WELAMA logo</li>
            </ol>
            <button type="button" className="a2hs-help-done" onClick={dismiss}>
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddToHomeScreen;
