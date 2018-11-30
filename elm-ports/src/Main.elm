port module Main exposing (main)

import Browser
import Html exposing (Html)
import Html.Attributes as Attr
import Html.Events as Events
import Json.Encode as Json


main : Program Flags Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }


init : Flags -> ( Model, Cmd Msg )
init _ =
    ( Model "", Cmd.none )


type alias Flags =
    ()


type alias Model =
    { text : String
    }


type Msg
    = Pull String
    | Alert String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Alert t ->
            ( model, alert t )

        Pull str ->
            ( { model | text = str }, Cmd.none )


port alert : String -> Cmd msg


port getVal : (String -> msg) -> Sub msg


view : Model -> Html Msg
view model =
    Html.div []
        [ Html.text "hello"
        , Html.button [ Events.onClick (Alert "aaa") ] [ Html.text "alert" ]
        , Html.text "model="
        , Html.text model.text
        ]


subscriptions : Model -> Sub Msg
subscriptions model =
    getVal Pull
