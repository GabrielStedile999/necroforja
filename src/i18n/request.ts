import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "./config";

/**
 * next-intl request config (no i18n routing — cookie based).
 *
 * The locale comes exclusively from the NEXT_LOCALE cookie set by the
 * language switcher in the nav. There is intentionally NO browser
 * detection: without a cookie the site is always English.
 */
export default getRequestConfig(async () => {
	const store = await cookies();
	const candidate = store.get(LOCALE_COOKIE)?.value;
	const locale = candidate && isLocale(candidate) ? candidate : defaultLocale;

	return {
		locale,
		messages: (await import(`../../messages/${locale}.json`)).default,
	};
});
