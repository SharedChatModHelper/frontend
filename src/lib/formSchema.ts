import {z, ZodType} from "zod";
import {FieldValues, useForm, UseFormProps, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

export const warnSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const timeoutSchema = z.object({
  reason: z.string().min(0).max(500),
  duration: z.coerce.number().int().min(1).max(1_209_600),
});

export const banSchema = z.object({
  reason: z.string().min(0).max(500),
});

export const pollSchema = z.object({
  title: z.string().min(1).max(60),
  duration: z.coerce.number().min(15).max(1800),
  channelPoints: z.coerce.number().min(0).max(1_000_000),
});

export function useDialogForm<Z extends ZodType, TFieldValues extends FieldValues = z.infer<Z>>(formSchema: Z, props: UseFormProps<TFieldValues>): UseFormReturn {
   return useForm<TFieldValues>({
    resolver: zodResolver(formSchema),
    ...props
  }) as UseFormReturn
}
