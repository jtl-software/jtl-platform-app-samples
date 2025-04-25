import Image from "next/image"
import { Globe, BarChart, Zap, ShoppingCart, CheckCircle, ArrowRight } from "lucide-react"

/**
 * Homepage
 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-6">
        <div className="container mx-auto max-w-7xl px-6 md:px-10 lg:px-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">JTL Translate</span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-28 lg:py-36">
          <div className="container mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
            <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-16 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Translate Your JTL Products With Ease
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Expand your e-commerce reach globally with JTL Translate. Seamlessly translate product descriptions,
                    titles, and attributes into multiple languages directly within your JTL ERP system.
                  </p>
                </div>
              </div>
              <Image
                src="https://placehold.co/550x550.svg"
                width={550}
                height={550}
                alt="JTL Translate dashboard showing product translations"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="w-full py-16 md:py-28 lg:py-36 bg-muted/50">
          <div className="container mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Trusted by E-commerce Leaders</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Join hundreds of online retailers who use JTL Translate to reach global markets
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 items-center justify-center pt-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-center">
                    <Image
                      src="https://placehold.co/120x60.svg"
                      alt={`Partner logo ${i}`}
                      width={120}
                      height={60}
                      className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-28 lg:py-36">
          <div className="container mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Everything You Need for Global Expansion
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  JTL Translate seamlessly integrates with your JTL ERP system to provide powerful translation
                  capabilities
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Globe className="h-10 w-10 text-primary" />,
                  title: "Multi-language Support",
                  description: "Translate your products into 40+ languages with just a few clicks",
                },
                {
                  icon: <Zap className="h-10 w-10 text-primary" />,
                  title: "One-Click Translation",
                  description: "Automatically translate all product fields with a single click",
                },
                {
                  icon: <BarChart className="h-10 w-10 text-primary" />,
                  title: "Translation Analytics",
                  description: "Track translation quality and performance across languages",
                },
                {
                  icon: <ShoppingCart className="h-10 w-10 text-primary" />,
                  title: "JTL Integration",
                  description: "Seamlessly works within your existing JTL ERP workflow",
                },
                {
                  icon: <CheckCircle className="h-10 w-10 text-primary" />,
                  title: "Human Review",
                  description: "Optional human review process for critical translations",
                },
                {
                  icon: <ArrowRight className="h-10 w-10 text-primary" />,
                  title: "Bulk Processing",
                  description: "Translate thousands of products simultaneously",
                },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center space-y-4 rounded-lg border p-8 shadow-sm">
                  {feature.icon}
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-16 md:py-28 lg:py-36 bg-muted/50">
          <div className="container mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Simple Integration, Powerful Results
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Get up and running with JTL Translate in minutes, not days
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-10 py-12 lg:grid-cols-2">
              <Image
                src="https://placehold.co/500x400.svg"
                width={500}
                height={400}
                alt="JTL Translate workflow diagram"
                className="mx-auto rounded-xl shadow-lg"
              />
              <div className="space-y-10">
                {[
                  {
                    number: "01",
                    title: "Install the Plugin",
                    description: "Add JTL Translate to your JTL ERP system with our simple installation wizard",
                  },
                  {
                    number: "02",
                    title: "Select Products",
                    description: "Choose which products and fields you want to translate",
                  },
                  {
                    number: "03",
                    title: "Choose Languages",
                    description: "Select your target languages from our extensive list",
                  },
                  {
                    number: "04",
                    title: "Translate & Review",
                    description: "Automatically translate content and optionally review before publishing",
                  },
                ].map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {step.number}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="w-full py-16 md:py-28 lg:py-36">
          <div className="container mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Simple, Transparent Pricing</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Choose the plan that fits your business needs
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-12 lg:grid-cols-3">
              {[
                {
                  name: "Starter",
                  price: "€49",
                  description: "Perfect for small stores just getting started with international sales",
                  features: ["Up to 500 products", "5 languages", "Basic support", "Monthly updates"],
                  popular: false,
                },
                {
                  name: "Professional",
                  price: "€99",
                  description: "Ideal for growing businesses expanding to multiple markets",
                  features: [
                    "Up to 2,000 products",
                    "15 languages",
                    "Priority support",
                    "Weekly updates",
                    "Human review credits",
                  ],
                  popular: true,
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  description: "For large retailers with complex translation needs",
                  features: [
                    "Unlimited products",
                    "All languages",
                    "24/7 dedicated support",
                    "Daily updates",
                    "Custom integrations",
                    "Dedicated account manager",
                  ],
                  popular: false,
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={`flex flex-col rounded-lg border p-8 shadow-sm ${
                    plan.popular ? "border-primary ring-1 ring-primary" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                      Most Popular
                    </div>
                  )}
                  <div className="relative space-y-4">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <ul className="my-8 space-y-3 flex-1">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-16 md:py-28 lg:py-36 bg-muted/50">
          <div className="container mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">What Our Customers Say</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Hear from businesses that have expanded globally with JTL Translate
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  quote:
                    "JTL Translate helped us expand to 5 new European markets in just 3 months. The translation quality is excellent.",
                  author: "Maria Schmidt",
                  company: "FashionPlus GmbH",
                },
                {
                  quote:
                    "The integration with our JTL system was seamless. We're now selling in 12 countries with minimal effort.",
                  author: "Thomas Weber",
                  company: "ElectroTech",
                },
                {
                  quote:
                    "The ROI on JTL Translate has been incredible. Our international sales increased by 240% in the first year.",
                  author: "Laura Müller",
                  company: "HomeGoods Direct",
                },
              ].map((testimonial, i) => (
                <div key={i} className="flex flex-col rounded-lg border bg-background p-8 shadow-sm">
                  <div className="flex-1">
                    <p className="text-muted-foreground">{testimonial.quote}</p>
                  </div>
                  <div className="mt-8 flex items-center gap-4">
                    <Image
                      src="https://placehold.co/60x60.svg"
                      alt={testimonial.author}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-28 lg:py-36 border-t">
          <div className="container mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Go Global?</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Start translating your JTL products today and reach customers worldwide
                </p>
                <p className="text-sm text-muted-foreground">
                  Contact us at <span className="font-medium">info@jtl-translate.com</span> to learn more
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-8">
        <div className="container mx-auto max-w-7xl px-6 md:px-10 lg:px-16 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium">JTL Translate</p>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} JTL Translate. This page was totally not AI generated. I swear.
          </p>
        </div>
      </footer>
    </div>
  )
}
