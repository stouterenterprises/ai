import WidgetPreview from "@/components/widget-preview";

export default function WidgetPage() {
  return (
    <div>
      <section className="card">
        <p className="eyebrow">Widget</p>
        <h2>Embeddable messenger</h2>
        <p>
          Add this snippet to any site to load the Nimbus messenger widget. The widget
          connects to Supabase Realtime for chat and uses department routing rules.
        </p>
        <pre>
          {`<script src="https://YOUR_DOMAIN/widget.js" data-business="YOUR_BUSINESS_ID"></script>`}
        </pre>
      </section>
      <section>
        <WidgetPreview />
      </section>
    </div>
  );
}
