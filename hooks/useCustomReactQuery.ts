// /* eslint-disable @typescript-eslint/no-explicit-any */

// import {
//   // QueryFunction,
//   useQuery,
//   UseQueryOptions,
// } from '@tanstack/react-query';
// import { useSession } from 'next-auth/react';

// import { setMultipleAxiosDefaultTokens } from '@/lib/apiClient';

// const useCustomReactQuery = <DataType>({
//   queryKey,
//   queryFn,
//   ...options
// }: {
//   queryKey: string[];
//   queryFn: any; //QueryFunction<DataType | undefined, string[], any> | undefined; //QueryFunction<unknown, any>;
//   options?: Omit<
//     UseQueryOptions<
//       DataType | undefined,
//       unknown,
//       DataType | undefined,
//       string[]
//     >,
//     'initialData' & { initialData: DataType | (() => DataType) }
//   >;
// }) => {
//   const { /*enabled = true,*/ ...queryOptions } = options || {};

//   const { data: session } = useSession();
//   const token = session?.user.access as string;

//   // console.log({ token });
//   // console.log({ retro: !!token });

//   setMultipleAxiosDefaultTokens(token);

//   return useQuery(queryKey, queryFn, {
//     ...queryOptions,
//     enabled: !!token,
//   });
// };

// export default useCustomReactQuery;
