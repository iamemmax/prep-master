import React from 'react';

export default function useBooleanStateControl(initialState = false) {
  const [state, setState] = React.useState(initialState);

  const setTrue = React.useCallback((): void => setState(true), []);
  const setFalse = React.useCallback((): void => setState(false), []);
  const toggle = React.useCallback((): void => setState(state => !state), []);

  return {
    state,
    setState,
    setTrue,
    setFalse,
    toggle,
  };
}
