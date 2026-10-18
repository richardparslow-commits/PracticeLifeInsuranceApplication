import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PracticeApplicationForm from "./components/PracticeApplicationForm";
import "./index.css";
function Page() {
  return (
    <>
      <a
        href="#worksheet"
        className="sr-only focus:not-sr-only focus:block focus:p-4"
      >
        Skip to worksheet
      </a>
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-6">
          <a
            href="https://lifeinsurancebrokeradvocate.com/"
            className="font-bold tracking-widest"
          >
            LIFE POLICY PILOT
          </a>
          <a
            href="https://lifeinsurancebrokeradvocate.com/"
            className="text-sm underline underline-offset-4"
          >
            ← Back to website
          </a>
        </div>
      </header>
      <main id="worksheet" className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
        <div className="no-print mx-auto mb-8 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-primary">
            Life Insurance Broker Advocate
          </p>
          <h1 className="text-4xl leading-tight sm:text-5xl">
            Practice Life Insurance Application
          </h1>
          <p className="mt-4 text-muted-foreground">
            Prepare at your own pace for a conversation with Richard Francis
            Parslow. Explore common questions and organize your information
            before a formal carrier application.
          </p>
        </div>
        <PracticeApplicationForm />
      </main>
      <footer className="no-print border-t p-6 text-center text-sm text-muted-foreground">
        Richard Francis Parslow · Life Insurance Broker Advocate / Life Policy
        Pilot
        <br />
        <a
          className="underline"
          href="mailto:richardparslow@lifepolicypilot.blog"
        >
          richardparslow@lifepolicypilot.blog
        </a>
      </footer>
    </>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/practice-application" element={<Page />} />
        <Route
          path="*"
          element={<Navigate to="/practice-application" replace />}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
