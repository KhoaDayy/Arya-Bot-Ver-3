import { CustomFeatures } from '@/config/types';
import { UseFormRender } from '@/config/types';
import { Flex } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useGuildChannelsQuery, useGuildRolesQuery } from '@/api/hooks';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

// Import sub-components
import { NotificationChannel } from './guild-war/NotificationChannel';
import { RoleConfig } from './guild-war/RoleConfig';
import { ScheduleConfig } from './guild-war/ScheduleConfig';
import { ReminderConfig } from './guild-war/ReminderConfig';
import { DeadlineConfig } from './guild-war/DeadlineConfig';
import { VoiceChannelConfig } from './guild-war/VoiceChannelConfig';
import { CustomizationPage } from './guild-war/CustomizationPage';

// ─── Main Feature Form ────────────────────────────────────────────────────────
export const useGuildWarFeature: UseFormRender<CustomFeatures['guiwar']> = (data, submit) => {
    const router = useRouter();
    const guildId = router.query.guild as string;
    const channels = useGuildChannelsQuery(guildId);
    const roles = useGuildRolesQuery(guildId);

    // Build merged defaults so color pickers don't start dirty
    const mergedDefaults = {
        ...data,
        reminderOffsets: data?.reminderOffsets ?? [30, 15, 5],
        signupDeadline: data?.signupDeadline ?? '20:00',
        customization: {
            bannerUrl: data?.customization?.bannerUrl ?? '',
            logoUrl: data?.customization?.logoUrl ?? '',
            pollTitle: data?.customization?.pollTitle ?? '',
            pingMessage: data?.customization?.pingMessage || '## \ud83d\udea8 \u0110\u1ebeN GI\u1edc WAR R\u1ed2I ANH EM!\\n### {day}\\n{mention}\\n> Vui l\u00f2ng online v\u00e0o game **ngay b\u00e2y gi\u1edd**, t\u1eadp k\u1ebft v\u00e0 Join Voice!\\n> Ch\u00fac party \u0111\u00e1nh war th\u00e0nh c\u00f4ng r\u1ef1c r\u1ee1! \ud83d\udcaa',
            reminderMessage: data?.customization?.reminderMessage || '## \u23f0 C\u00f2n {minutes} ph\u00fat \u2014 Guild War {day}!\\n{mention} Chu\u1ea9n b\u1ecb v\u00e0o game v\u00e0 Join Voice nh\u00e9!',
            accentColorPoll: data?.customization?.accentColorPoll ?? '#5865F2',
            accentColorPing: data?.customization?.accentColorPing ?? '#E74C3C',
            accentColorReminder: data?.customization?.accentColorReminder ?? '#F39C12',
        },
    };

    const form = useForm<CustomFeatures['guiwar']>({
        defaultValues: mergedDefaults,
    });

    // Reset form when API data arrives/changes
    useEffect(() => {
        form.reset(mergedDefaults);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    // ── Manual dirty tracking (bypasses react-hook-form isDirty bugs) ──
    const savedRef = useRef(JSON.stringify(mergedDefaults));
    useEffect(() => {
        savedRef.current = JSON.stringify(mergedDefaults);
    }, [data]);

    const watchedValues = form.watch();
    const hasChanges = JSON.stringify(watchedValues) !== savedRef.current;

    const onSubmit = form.handleSubmit(async (values) => {
        // Normalise empty strings → null so bot uses defaults
        if (values.customization) {
            const c = values.customization as Record<string, string | undefined>;
            for (const key of Object.keys(c)) {
                if (c[key] === '') c[key] = undefined;
            }
        }
        await submit(JSON.stringify(values));
        // Update baseline after successful save
        savedRef.current = JSON.stringify(form.getValues());
    });

    return {
        onSubmit,
        canSave: hasChanges,
        reset() {
            form.reset(mergedDefaults);
            savedRef.current = JSON.stringify(mergedDefaults);
        },
        component: (
            <Flex direction="column" gap={5} w="full" id="guiwar-form">
                <NotificationChannel control={form.control} channels={channels} />
                <RoleConfig control={form.control} roles={roles} />
                <ScheduleConfig control={form.control} />
                <ReminderConfig control={form.control} />
                <DeadlineConfig control={form.control} />
                <VoiceChannelConfig control={form.control} channels={channels} />
                <CustomizationPage form={form} />
            </Flex>
        ),
    };
};
