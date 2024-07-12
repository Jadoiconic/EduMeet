import { useContext, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import AxiosInstance from "../../lib/axiosInstance";
import { ICreateMeetingRoomResponse } from "../../types/meetings.interface";
import { useParams } from "react-router-dom";
import { UserContext } from "../../hooks/context/UserContext";
import { MeetingRoomContext } from "../../hooks/context/meetings/MeetingRoomContext";
import { socket } from "../../lib/socket";

type IMeetingRoomData = {
  sessionId: number;
  passcode?: string | undefined;
  meetingType: "instant" | "scheduled";
  userId: string | null | undefined;
};

const CreateMeetingRoom = async (data: IMeetingRoomData) => {
  const response = await AxiosInstance({
    url: `/meeting-rooms`,
    method: "POST",
    data,
  });
  return response.data;
};

export const useCreateMeetingRoom = (
  onSuccessCallback: (data: ICreateMeetingRoomResponse) => void
) => {
  const queryClient = useQueryClient();

  return useMutation<ICreateMeetingRoomResponse, Error, IMeetingRoomData>(
    (data: IMeetingRoomData) => CreateMeetingRoom(data),
    {
      onSuccess: (data: ICreateMeetingRoomResponse) => {
        queryClient.invalidateQueries("meetingRooms");
        onSuccessCallback(data);
      },
    }
  );
};

export const useMeetingRoom = () => {
  const [enlargeChatSize, setEnlargeChatSize] = useState(false);
  const [enlargeParticipantsSize, setEnlargeParticipantsSize] = useState(false);
  const chatSizeHandler = () => setEnlargeChatSize(!enlargeChatSize);
  const participantsSizeHandler = () => setEnlargeParticipantsSize(!enlargeParticipantsSize);

  const { roomId } = useParams();
  const { user } = useContext(UserContext);
  const { setMeetingRoomId } = useContext(MeetingRoomContext);

  useEffect(() => {
    if (!roomId || !user) return;
    socket.emit("join-meeting-room", { roomId, user });
  }, [roomId, user]);

  useEffect(() => {
    setMeetingRoomId(roomId || "");
  }, [roomId, setMeetingRoomId]);
  return {
    chatSizeHandler,
    participantsSizeHandler,
    enlargeChatSize,
    enlargeParticipantsSize,
  };
};
