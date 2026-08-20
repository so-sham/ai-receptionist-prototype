// Router + provider. FROZEN after Phase 4: later phases only replace the bodies
// of the screen components below, never this file.

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ConsoleProvider } from './state';
import ConsoleLayout from './layout/ConsoleLayout.jsx';

import TodayScreen from './screens/today/TodayScreen.jsx';
import CallsScreen from './screens/calls/CallsScreen.jsx';
import ApprovalsScreen from './screens/approvals/ApprovalsScreen.jsx';
import AgentScreen from './screens/agent/AgentScreen.jsx';
import QualityScreen from './screens/quality/QualityScreen.jsx';

export default function App() {
  return (
    <ConsoleProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ConsoleLayout />}>
            <Route index element={<Navigate to="/today" replace />} />
            <Route path="today" element={<TodayScreen />} />
            <Route path="calls" element={<CallsScreen />} />
            <Route path="approvals" element={<ApprovalsScreen />} />
            <Route path="agent" element={<AgentScreen />} />
            <Route path="quality" element={<QualityScreen />} />
            <Route path="*" element={<Navigate to="/today" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConsoleProvider>
  );
}
