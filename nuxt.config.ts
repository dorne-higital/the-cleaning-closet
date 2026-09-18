export default defineNuxtConfig({
	compatibilityDate: '2025-01-01',
	devtools: { enabled: true },

	modules: ['@nuxt/image', '@nuxt/icon', '@nuxtjs/supabase'],

	// Every image in this app is dynamic content from Supabase Storage
	// (uploaded via the CMS), which already serves everything through its
	// own CDN — there's no local/static image usage that benefits from
	// Nuxt Image's default IPX provider resizing it further. Also sidesteps
	// IPX's dependency on sharp's native binary, which is fragile on
	// serverless platforms (works locally, can silently fail to load the
	// right platform build in a deployed function) — 'none' just passes the
	// original URL straight through as a plain <img>, no server-side
	// processing involved.
	image: {
		provider: 'none',
	},

	// We drive /admin protection ourselves via app/middleware/admin-auth.global.ts
	// (already scoped to just /admin/**) — the module's own auto-redirect would
	// otherwise gate the whole site, including the public catch-all pages.
	supabase: {
		redirect: false,
	},

	components: [
		{ path: '~/components', pathPrefix: false },
		// global: true — BlockRenderer/BlockCanvas resolve these by name at
		// runtime via resolveComponent(block.type), which only finds
		// components registered app-wide, not ones merely auto-imported.
		{ path: '~~/content-blocks', pathPrefix: false, extensions: ['vue'], global: true },
	],

	css: ['~/assets/scss/main.scss'],

	// content-blocks/ sits outside app/ (Nuxt's srcDir), so it isn't covered
	// by the generated tsconfig's `include` by default even though it's
	// registered as a component dir above — without this, editors resolve
	// files in there via TS's flakier "orphan file" fallback instead of the
	// real project, which is why aliases like #shared/* sometimes fail to
	// resolve there (inconsistently, since it's cache-dependent) despite
	// `nuxt typecheck` always passing.
	typescript: {
		tsConfig: {
			include: ['../content-blocks/**/*'],
		},
	},

	runtimeConfig: {
		resendApiKey: '',
		contactEmailTo: 'you@example.com',
		contactEmailFrom: 'Your Name <onboarding@resend.dev>',
		supabaseUrl: '',
		supabaseServiceKey: '',
		// Self-serve checkout (see server/utils/stripe.ts) — all optional,
		// upgrades just stay unavailable if these are blank.
		stripeSecretKey: '',
		stripeWebhookSecret: '',
		// Nuxt's automatic camelCase→ENV_VAR derivation drops the underscore
		// before a leading digit (stripePrice2gb → NUXT_STRIPE_PRICE2GB), which
		// doesn't match the NUXT_STRIPE_PRICE_2GB/_10GB names documented in the
		// README/.env.example and already set wherever this is deployed — so
		// these two need an explicit env read instead of relying on the
		// auto-derived name.
		stripePrice2gb: process.env.NUXT_STRIPE_PRICE_2GB ?? '',
		stripePrice10gb: process.env.NUXT_STRIPE_PRICE_10GB ?? '',
		stripePriceUnlimited: '',
		stripePriceGrowth: '',
		stripePricePro: '',
		public: {
			// Site's real deployed URL, no trailing slash — used to build the
			// absolute URLs robots.txt/sitemap.xml require.
			siteUrl: '',
			stripePublishableKey: '',
		},
	},

	app: {
		head: {
			// Fallback only — /admin/settings' site name + app/layouts/default.vue's
			// titleTemplate take over once client-side data loads. This is what
			// shows in the raw HTML before that, so keep it a neutral placeholder.
			title: 'My Site',
			meta: [
				{
					name: 'description',
					content: 'A new site is on the way — get in touch in the meantime.',
				},
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
				{ name: 'theme-color', content: '#18181b' },
			],
			link: [
				{
					rel: 'preconnect',
					href: 'https://fonts.googleapis.com',
				},
				{
					rel: 'preconnect',
					href: 'https://fonts.gstatic.com',
					crossorigin: 'anonymous',
				},
				{
					rel: 'stylesheet',
					href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap',
				},
			],
		},
	},
})
