"use client";

import { useCallback, useState } from "react";
import { slugify } from "@/lib/utils";

interface UseSlugFieldSyncParams {
    onSlugChange: (value: string) => void;
}

export const useSlugFieldSync = ({ onSlugChange }: UseSlugFieldSyncParams) => {
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    const handleSourceValueChange = useCallback(
        (value: string) => {
            if (!slugManuallyEdited) {
                onSlugChange(slugify(value));
            }
        },
        [onSlugChange, slugManuallyEdited],
    );

    const markSlugAsEdited = useCallback(() => {
        setSlugManuallyEdited(true);
    }, []);

    return {
        handleSourceValueChange,
        markSlugAsEdited,
    };
};
