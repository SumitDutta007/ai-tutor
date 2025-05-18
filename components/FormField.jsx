import {
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
  import { Input } from "@/components/ui/input"
import { Controller } from "react-hook-form"

const FormField = ({control, name, label, placeholder, type})=>{
    return(
        <Controller name={name} control={control} render={({ field }) => (
                <FormItem>
                <FormLabel className="label">{label}</FormLabel>
                <FormControl>
                <Input className="input" placeholder={placeholder} type={type} {...field}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
    )
}
export default FormField