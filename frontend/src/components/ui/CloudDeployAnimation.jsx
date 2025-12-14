import React from "react";
import styled, { keyframes } from "styled-components";

const CloudDeployAnimation = ({ size = 20 }) => {
  return (
    <SpinnerWrapper size={size}>
      <div className="spinner" />
    </SpinnerWrapper>
  );
};

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  .spinner {
    width: ${({ size }) => size * 2}px;
    height: ${({ size }) => size * 2}px;
    border: ${({ size }) => size / 5}px solid rgba(234, 179, 8, 0.2);
    border-top: ${({ size }) => size / 5}px solid #eab308;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
  }
`;

export default CloudDeployAnimation;
