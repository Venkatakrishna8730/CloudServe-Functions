import React from "react";
import styled from "styled-components";

const BouncingLoader = ({ size = 20 }) => {
  return (
    <Wrapper size={20}>
      <div className="row">
        <div className="item">
          <div className="ball" />
          <div className="shadow" />
        </div>
        <div className="item">
          <div className="ball" />
          <div className="shadow" />
        </div>
        <div className="item">
          <div className="ball" />
          <div className="shadow" />
        </div>
      </div>
    </Wrapper>
  );
};
const Wrapper = styled.div`
  width: ${({ size }) => size * 6}px;
  height: ${({ size }) => size * 3}px;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  .row {
    display: flex;
    gap: ${({ size }) => size * 1.5}px; /* EVEN GAP */
  }

  .item {
    position: relative;
    width: ${({ size }) => size}px;
    height: ${({ size }) => size * 2}px;
  }

  .ball {
    width: ${({ size }) => size}px;
    height: ${({ size }) => size}px;
    background: linear-gradient(135deg, #fde047, #facc15, #eab308);
    border-radius: 50%;
    position: absolute;
    bottom: ${({ size }) => size / 2}px;
    animation: bounce 0.6s ease-in-out infinite alternate;
  }

  .item:nth-child(2) .ball {
    animation-delay: 0.15s;
  }

  .item:nth-child(3) .ball {
    animation-delay: 0.3s;
  }

  .shadow {
    width: ${({ size }) => size}px;
    height: ${({ size }) => size / 4}px;
    background: radial-gradient(
      ellipse at center,
      rgba(234, 179, 8, 0.6),
      rgba(234, 179, 8, 0.15)
    );
    border-radius: 50%;
    position: absolute;
    bottom: 0;
    filter: blur(1.5px);
    animation: shadow 0.6s ease-in-out infinite alternate;
  }

  .item:nth-child(2) .shadow {
    animation-delay: 0.15s;
  }

  .item:nth-child(3) .shadow {
    animation-delay: 0.3s;
  }

  @keyframes bounce {
    from {
      transform: translateY(14px) scaleX(1.4);
    }
    to {
      transform: translateY(0) scaleX(1);
    }
  }

  @keyframes shadow {
    from {
      transform: scaleX(1.4);
      opacity: 0.6;
    }
    to {
      transform: scaleX(0.6);
      opacity: 0.3;
    }
  }
`;

export default BouncingLoader;
