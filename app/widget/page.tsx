import WidgetPreview from "@/components/widget-preview";
import WidgetSnippet from "@/components/widget-snippet";

export default function WidgetPage() {
  return (
    <div>
      <section className="card">
        <p className="eyebrow">Widget</p>
        <h2>Embeddable messenger</h2>
        <p>
          Add this snippet to any site to load the Nimbus messenger widget. The widget
          connects to the real-time messaging service for chat and uses department routing rules.
        </p>
        <WidgetSnippet />
      </section>
      <section>
        <WidgetPreview />
      </section>
    </div>
  );
}
