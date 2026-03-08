import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Creates and Updates Query params of the Window URL
 * @param queryName The name of the Query params.
 * @param queryValue The corresponding value of the Query params name.
 * @returns the newly created or updated URL
 */
export default function useChangeQueryParams() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const changeQueryParams = (queryName: string, queryValue: string) => {
    // now you got a read/write URL object
    const current = new URLSearchParams(Array.from(searchParams.entries())); // -> has to use this form

    // update as necessary
    const value = queryValue?.trim();

    if (value === current.get(queryName.toString())) {
      return;
    }
    if (value) {
      current.set(queryName.toString(), queryValue);
    }
    // cast to string
    const search = current.toString();
    // or const query = `${'?'.repeat(search.length && 1)}${search}`;
    const query = search ? `?${search}` : '';

    router.push(`${pathname}${query}`);
  };

  return { changeQueryParams };
}
