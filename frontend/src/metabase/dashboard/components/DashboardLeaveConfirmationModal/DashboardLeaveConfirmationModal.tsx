import type { Route } from "react-router";
import { t } from "ttag";

import ConfirmContent from "metabase/components/ConfirmContent";
import {
  LeaveConfirmationModal,
  LeaveConfirmationModalContent,
} from "metabase/components/LeaveConfirmationModal";
import { updateDashboardAndCards } from "metabase/dashboard/actions/save";
import { useDispatch } from "metabase/lib/redux";
import { dismissAllUndo } from "metabase/redux/undo";

import { isNavigatingToCreateADashboardQuestion } from "./utils";

interface DashboardLeaveConfirmationModalProps {
  isEditing: boolean;
  isDirty: boolean;
  route: Route;
}

export const DashboardLeaveConfirmationModal = ({
  isEditing,
  isDirty,
  route,
}: DashboardLeaveConfirmationModalProps) => {
  const dispatch = useDispatch();

  // TODO: should this come from props?
  const onSave = async () => {
    dispatch(dismissAllUndo());
    await dispatch(updateDashboardAndCards());
  };

  return (
    <LeaveConfirmationModal isEnabled={isEditing && isDirty} route={route}>
      {({ nextLocation, onAction, onClose }) => {
        if (isNavigatingToCreateADashboardQuestion(nextLocation)) {
          return (
            <ConfirmContent
              cancelButtonText={t`Cancel`}
              confirmButtonText={t`Save changes and go`}
              confirmButtonPrimary
              data-testid="leave-for-new-dashboard-question-confirmation"
              message={t`That’ll keep things tidy.`}
              title={t`Let’s save your changes and create your new question`}
              onAction={async () => {
                await onSave();
                onAction?.();
              }}
              onClose={onClose}
            />
          );
        }

        return (
          <LeaveConfirmationModalContent
            onAction={onAction}
            onClose={onClose}
          />
        );
      }}
    </LeaveConfirmationModal>
  );
};
