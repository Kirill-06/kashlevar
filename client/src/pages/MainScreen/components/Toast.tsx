import React from 'react';

type Props = {
  message: string;
};

export const Toast: React.FC<Props> = ({ message }) => {
  if (!message) return null;
  return <div className="mainScreen-toast">{message}</div>;
};
