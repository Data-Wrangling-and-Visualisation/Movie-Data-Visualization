import { useState, useEffect, useRef } from 'react';
import { useVisibility } from '../hooks/useChartVisibility';

const ExplorationSection = () => {
  const [sectionRef, isSectionVisible] = useVisibility();
  const [textRef, isTextVisible] = useVisibility();
  const [chartsRef, areChartsVisible] = useVisibility();

  return (
    <section 
      ref={sectionRef}
      className="exploration-section"
    >
      <div 
        ref={textRef}
        className={`exploration-text ${areChartsVisible ? 'charts-visible' : ''}`}
      >
        Key insights obtained from correlation data:
      </div>

      <div 
        ref={chartsRef}
        className={`insight-grid ${isSectionVisible ? 'visible' : ''}`}
        >
          <div className="insight-card">
            <h3 style={{ marginBottom: '30px' }}> <span className="text-blue">Budget</span> Drives Revenue</h3>
            <p style={{ marginBottom: '30px' }}><span>US Gross:</span> 0.79<br />
              <span>Worldwide:</span> 0.80<br />
              <span>Russia:</span> 0.64</p>
            <p className="conclusion">➤ Bigger budgets lead to higher revenue across markets.</p>
          </div>

          <div className="insight-card">
            <h3 style={{ marginBottom: '30px' }}> <span className="text-blue">Markets</span> Are Interconnected</h3>
            <p style={{ marginBottom: '30px' }}><span>US ↔ Worldwide:</span> 0.95<br />
              <span>US ↔ Russia:</span> 0.68<br />
              <span>Worldwide ↔ Russia:</span> 0.78</p>
            <p className="conclusion">➤ US performance is a strong global predictor.</p>
          </div>

          <div className="insight-card">
            <h3 style={{ marginBottom: '30px' }}> <span className="text-blue">Ratings</span> Have Little Impact</h3>
            <p style={{ marginBottom: '30px' }}><span>Budget:</span> -0.05<br />
              <span>Gross:</span> 0.04<br />
              <span>Audience:</span> 0.28</p>
            <p className="conclusion">➤ Ratings don’t significantly affect success.</p>
          </div>

          <div className="insight-card">
            <h3 style={{ marginBottom: '30px' }}> <span className="text-blue">Audience</span> = Revenue</h3>
            <p style={{ marginBottom: '30px' }}><span>US Gross:</span> 0.86<br />
              <span>Worldwide:</span> 0.74<br />
              <span>Profit:</span> 0.80</p>
            <p className="conclusion">➤ Larger audience = greater revenue.</p>
          </div>

          <div className="insight-card">
            <h3 style={{ marginBottom: '30px' }}>  <span className="text-blue">Runtime's</span> Influence</h3>
            <p style={{ marginBottom: '30px' }}><span>Budget:</span> 0.38<br />
              <span>Worldwide:</span> 0.37</p>
            <p className="conclusion">➤ Longer movies often cost more and earn more.</p>
          </div>

          <div className="insight-card">
            <h3 style={{ marginBottom: '30px' }}> <span className="text-blue">Profit</span> Follows Revenue</h3>
            <p style={{ marginBottom: '30px' }}><span>Worldwide:</span> 0.99<br />
              <span>Budget:</span> 0.74</p>
            <p className="conclusion">➤ Profit is almost entirely revenue-driven.</p>
          </div>
      </div>
    </section>
  );
};

export default ExplorationSection;