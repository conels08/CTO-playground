export default function SupportThisProject() {
  return (
    <section id="support" className="mt-12 border-t border-border pt-8">
      <h2 className="text-xl font-semibold text-foreground">Support this project</h2>

      <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
        Quit Smoking Tracker is free and always will be. If you find it helpful and would like
        to support continued development of this and future tools, you can do so below. Support
        is completely optional and never required to use the app. On PayPal, I may appear as
        "Site Assistant PDX" (my registered business name).
      </p>

      <div className="mt-4">
        <form action="https://www.paypal.com/donate" method="post" target="_blank">
          <input type="hidden" name="business" value="colbynelsen@gmail.com" />
          <input type="hidden" name="no_recurring" value="0" />
          <input type="hidden" name="item_name" value="To provide free, useful online tools for as many people as possible." />
          <input type="hidden" name="currency_code" value="USD" />
          <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
          <img alt="" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
        </form>

      </div>
    </section>
  );
}
