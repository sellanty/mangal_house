import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/header/header";
import { ListFood } from "@/components/listFood/listFood";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1">
      
      {/* Шапка ресторана */}
      <Header />
      {/* Список блюд */}
      <ListFood />

    </SafeAreaView>
  );
}
