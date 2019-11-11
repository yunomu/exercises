module Main exposing (main)

import Browser
import Browser.Navigation as Nav
import Html
import Html.Attributes as Attr
import Html.Events as Events
import Reference exposing (Reference)
import Reference.List
import Url


type alias Flags =
    ()


type Entry
    = Entry String (List Entry)


type alias Model =
    { key : Nav.Key
    , url : Url.Url
    , list : List Entry
    }


type Msg
    = LinkClicked Browser.UrlRequest
    | UrlChanged Url.Url
    | ListEdit (Reference Entry (List Entry)) String
    | ListDel (Reference Entry (List Entry))


init : Flags -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
    ( { key = key
      , url = url
      , list =
            let
                f es =
                    List.indexedMap (\i t -> Entry t (f [] es))
            in
            f [ "123", "456" ] [ "abc", "def", "ghi" ]
      }
    , Cmd.none
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ListEdit ref text ->
            ( { model
                | list = Reference.root <| Reference.modify (\(Entry t es) -> Entry text es) ref
              }
            , Cmd.none
            )

        _ ->
            ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


renderEntry : Reference Entry (List Entry) -> Html.Html Msg
renderEntry ref =
    let
        (Entry text es) =
            Reference.this ref
    in
    Html.div []
        [ Html.input [ Attr.value text, Events.onInput (ListEdit ref) ] []
        , Html.div
            [ Events.onClick <|
                ListEdit
                    (Reference.fromRecord
                        { this = Reference.this ref
                        , rootWith = \e -> List.filter (\(Entry t _) -> t /= text) <| Reference.root ref
                        }
                    )
                    ""
            ]
            [ Html.text "del" ]
        , Html.ul [] <|
            List.map (\e -> Html.li [] [ e ]) <|
                (Reference.List.unwrap renderEntry <|
                    Reference.fromRecord
                        { this = es
                        , rootWith = Reference.rootWith ref << Entry text
                        }
                )
                    ++ [ Html.div
                            [ Events.onClick <|
                                ListEdit
                                    (Reference.fromRecord
                                        { this = Entry "" []
                                        , rootWith = \e -> Reference.rootWith ref <| Entry text (es ++ [ e ])
                                        }
                                    )
                                    ""
                            ]
                            [ Html.text "add" ]
                       ]
        ]


view : Model -> Browser.Document Msg
view model =
    let
        _ =
            Debug.log "list" model.list
    in
    { title = "application"
    , body =
        [ Html.text "test"
        , Html.ul [] <|
            List.map (\e -> Html.li [] [ e ]) <|
                (Reference.List.unwrap renderEntry <|
                    Reference.top model.list
                )
                    ++ [ Html.div
                            [ Events.onClick <|
                                ListEdit
                                    (Reference.fromRecord
                                        { this = Entry "" []
                                        , rootWith = \e -> model.list ++ [ e ]
                                        }
                                    )
                                    ""
                            ]
                            [ Html.text "add" ]
                       ]
        ]
    }


main : Program Flags Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        , onUrlChange = UrlChanged
        , onUrlRequest = LinkClicked
        }
