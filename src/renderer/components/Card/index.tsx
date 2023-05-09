import React from "react";

import "./styles.scss";

interface CardProps {
  children: JSX.Element[] | JSX.Element;
}

const Card: React.FC<CardProps> = ({ children }) => {
  return <div className="card-teaser">{children}</div>;
};

export default Card;
