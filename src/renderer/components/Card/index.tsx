import React from "react";

import "./styles.scss";

const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div {...props} className={`card ${className}`}>
      {children}
    </div>
  );
};

export default Card;
