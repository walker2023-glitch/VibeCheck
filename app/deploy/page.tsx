import { ComingSoon, FlowPreview } from "@/components/preview/ComingSoon";

export default function DeployPage() {
  return (
    <ComingSoon
      title="Get your project ready to go online."
      description="Deploy will analyze your stack and give a checklist with reasons for each step. It will not deploy anything automatically, and nothing here is fabricated as a live deployment result."
      badge="Deploy · preview"
      accentClassName="text-success"
      planned={[
        "Stack detection from your files",
        "Configuration and secrets checklist (names only)",
        "Build and runtime guidance",
        "Hosting options with tradeoffs"
      ]}
      preview={
        <FlowPreview
          steps={[
            "Repository",
            "Stack detected",
            "Configuration checklist",
            "Build guidance",
            "Hosting options"
          ]}
          accentClassName="border-success/40 bg-success/15 text-success"
        />
      }
    />
  );
}
