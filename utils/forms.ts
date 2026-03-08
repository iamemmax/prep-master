import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { ReadonlyURLSearchParams } from 'next/navigation';

/**
 * Retrieves the value of an input element from a form.
 *
 * @param form - The HTMLFormElement representing the form containing the input element.
 * @param valueName - The name attribute value of the input element.
 * @returns The value of the input element.
 */
export function getInputValueFromForm(
  form: HTMLFormElement,
  valueName: string
) {
  const { value } = form.elements.namedItem(valueName) as HTMLInputElement;
  return value;
}

export const changeQueryParamsInRouter = (
  router: AppRouterInstance,
  pathname: string,
  searchParams: ReadonlyURLSearchParams,
  queryName: string,
  queryValue: string
) => {
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
