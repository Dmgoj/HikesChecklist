import { useState } from "react";
import { addToBucketList, removeFromBucketList } from "../api/bucketListApi";
import { useAuth } from "../auth/useAuth";

interface Props {
  peakId: number;
  initialOnList: boolean;
  onChange?: (onList: boolean) => void;
}

export function BucketListToggleButton({ peakId, initialOnList, onChange }: Props) {
  const { isAuthenticated } = useAuth();
  const [onList, setOnList] = useState(initialOnList);
  const [busy, setBusy] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  async function handleClick() {
    setBusy(true);
    try {
      if (onList) {
        await removeFromBucketList(peakId);
        setOnList(false);
        onChange?.(false);
      } else {
        await addToBucketList(peakId);
        setOnList(true);
        onChange?.(true);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={busy}>
      {onList ? "On bucket list ✓" : "Add to bucket list"}
    </button>
  );
}
