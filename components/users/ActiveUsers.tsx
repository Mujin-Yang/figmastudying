import {useOthers} from "@liveblocks/react/suspense";
import {useSelf} from "@liveblocks/react";
import {Avatar} from "@/components/users/Avatar";
import styles from "./index.module.css"
import {generateRandomName} from "@/lib/utils";
import {useMemo} from "react";


const ActiveUsers = () => {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > 3;

  const memorizedUsers = useMemo(() => {
      return(
      <div className="flex items-center justify-center gap-1 py-2">
          <div className="flex pl-3">
              {currentUser && (
                  <Avatar otherStyles='border-[3px] border-primary-green' name="You"/>
              )}

              {users.slice(0, 3).map(({connectionId}) => {
                  return (
                      <Avatar key={connectionId} otherStyles='-ml-3' name={generateRandomName()}/>
                  );
              })}

              {hasMoreUsers && <div className={styles.more}>+{users.length - 3}</div>}

          </div>
      </div>
      )
  },[users.length])
    //这样是防止avatar 头像的颜色不断变化，只在others改变的时候改变

    return memorizedUsers;
}

export default ActiveUsers;