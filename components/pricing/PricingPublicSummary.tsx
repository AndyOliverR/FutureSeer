import { PUBLIC_PRICING_OFFERS } from '@/lib/seo/publicPricingCatalog';

/** Static HTML pricing matrix — crawlable without client JS. */
export function PricingPublicSummary() {
  return (
    <section
      className="mb-10 rounded-2xl border border-amber-500/25 bg-slate-950/50 p-5 sm:p-6"
      aria-labelledby="pricing-public-summary-heading"
    >
      <h2 id="pricing-public-summary-heading" className="text-xl font-semibold text-amber-300 mb-2">
        Plan overview
      </h2>
      <p className="text-white/75 text-sm mb-4 max-w-3xl">
        Start with a 30-day trial, then choose monthly (Coffee), quarterly (Treat), or annual (Hamper).
        Amounts below show India (INR) and United States (USD) reference prices; checkout uses your account country.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/15 text-amber-200/90">
              <th className="py-2 pr-4 font-semibold">Plan</th>
              <th className="py-2 pr-4 font-semibold">Billing</th>
              <th className="py-2 pr-4 font-semibold">India</th>
              <th className="py-2 pr-4 font-semibold">United States</th>
            </tr>
          </thead>
          <tbody>
            {PUBLIC_PRICING_OFFERS.map((offer) => {
              const inPrice = offer.prices.find((p) => p.countryCode === 'IN');
              const usPrice = offer.prices.find((p) => p.countryCode === 'US');
              return (
                <tr key={offer.id} className="border-b border-white/10 text-white/85 align-top">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-white">{offer.name}</div>
                    <div className="text-white/60 text-xs mt-1 max-w-xs">{offer.description}</div>
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">{offer.billingPeriod}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">{inPrice?.priceLabel ?? '—'}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">{usPrice?.priceLabel ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ul className="mt-4 text-xs text-white/60 list-disc pl-5 space-y-1">
        <li>Paid tiers unlock the full generate-once report library and Ask the Seer.</li>
        <li>Trial offers teaser previews; upgrade for complete tool reports.</li>
        <li>Not medical, legal, or financial advice—see Disclaimer.</li>
      </ul>
    </section>
  );
}
